'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import config from 'config';

import Provider from '../provider/provider';
import Metrics from '../utils/MetricsUtils';

const provider = new Provider();

let debug = false;
if (config.has('debug')) {
    debug = config.get('debug');
}

let metrics = null;
if (debug) {
    const filePath = __dirname.replace('components', '') + '/metrics/ContextManager.txt';
    metrics = new Metrics(filePath);
}

/**
 * ContextManager
 */
export default class {

    /**
     * It takes as input the user's context and transform it into the decorated one.
     * This context is first merged with the full CDT in the database.
     * Decorated CDT mean an object composed in this way:
     * - interestTopic: the interest topic selected
     * - filterNodes: the list of filter nodes (also include the descendants of each node)
     * - rankingNodes: the list of ranking nodes (also include the descendants of each node)
     * - specificNodes: the list of specific nodes (assumed that they are ranking nodes)
     * - parametersNodes: the list of parameter nodes
     * - supportServiceCategories: the list of categories for which retrieve the support services
     * - supportServiceNames: the list of names and operations for selected the correct support services
     * @param {Object} context - The user's context
     * @returns {Object} The decorated CDT
     */
    getDecoratedCdt (context) {
        const startTime = process.hrtime();
        return this
            //merge the CDT full description with the values from the user's context
            ._mergeCdtAndContext(context)
            .then(mergedCdt => {
                //find the filter nodes (plus their respective descendants)
                return Promise
                    .props({
                        //get the interest topic
                        interestTopic: this._getInterestTopic(mergedCdt),
                        //find the filter nodes (plus their respective descendants)
                        filterNodes: this._getFilterNodes(mergedCdt._id, mergedCdt.context),
                        //find the ranking nodes (plus their respective descendants)
                        rankingNodes: this._getRankingNodes(mergedCdt._id, mergedCdt.context),
                        //find the specific nodes
                        specificNodes: this._getSpecificNodes(mergedCdt.context),
                        //find the parameter nodes
                        parameterNodes: this._getParameterNodes(mergedCdt.context),
                        //find the support service categories requested
                        supportServiceCategories: this._getSupportServiceCategories(mergedCdt),
                        //find the support service names and operations requested
                        supportServiceNames: this._getSupportServiceNames(mergedCdt),
                        //add the CDT identifier
                        _id: mergedCdt._id
                    })
            })
            .finally(() => {
                if (debug) {
                    metrics.record('getDecoratedCdt', startTime);
                    metrics.saveResults();
                }
            });
    }

    /**
     * Find the current CDT and add values for the dimension and parameters node from the user context
     * @param {Object} context - The user context
     * @returns {Object} The merged CDT
     * @throws {Error} If the CDT is not found in the database
     * @private
     */
    _mergeCdtAndContext (context) {
        const startTime = process.hrtime();
        return new Promise ((resolve, reject) => {
            provider
                .getCdt(context._id)
                .then(cdt => {
                    if (debug) {
                        metrics.record('getCdt', startTime);
                    }
                    //check if the related CDT is found
                    if (!_.isNull(cdt)) {
                        //create the map of user context values
                        let mapContext = this._createMap(context.context);
                        //merging the CDT description with the user context
                        let mergedCdt = this._mergeObjects(cdt.context, mapContext);
                        //create the final object
                        let obj = {
                            _id: cdt._id,
                            context: mergedCdt
                        };
                        if (_.has(context, 'support')) {
                            obj.support = context.support;
                        }
                        resolve(obj);
                    } else {
                        reject('No CDT found. Check if the ID is correct');
                    }
                })
                .catch(err => {
                    reject(err);
                })
                .finally(() => {
                    if (debug) {
                        metrics.record('mergeCdtAndContext', startTime);
                    }
                });
        });
    }

    /**
     * Create a map of the user's context values
     * @param {Array} list - The user context
     * @returns {Map} The map with all the active selection made by the user
     * @private
     */
    _createMap (list) {
        let map = new Map();
        list.forEach (item => {
            if (_.has(item, 'dimension') && _.has(item, 'value')) {
                if (!map.has(item.dimension)) {
                    map.set(item.dimension, item.value);
                }
            }
            if (_.has(item, 'parameters')) {
                item.parameters.forEach(param => {
                    if (_.has(param, 'name') && _.has(param, 'value')) {
                        if (!map.has(param.name)) {
                            map.set(param.name, param.value);
                        }
                    }
                    if (_.has(param, 'fields')) {
                        param.fields.forEach(field => {
                           if (_.has(field, 'name') && _.has(field, 'value')) {
                               if (!map.has(field.name)) {
                                   map.set(field.name, field.value);
                               }
                           }
                        });
                    }
                });
            }
        });
        return map;
    }

    /**
     * Merge the CDT description with the user's context values
     * @param {Array} list - The list of CDT items (context, parameter, field)
     * @param {Map} map - The map containing the user's context
     * @returns {Array} The merged list of CDT items
     * @private
     */
    _mergeObjects (list, map) {
        let output = [];
        list.forEach(item => {
            let addObject = false;
            //get the dimension name
            let dim = item.dimension || item.name;
            //acquire the value from the user context, if exists
            let value = undefined;
            if (map.has(dim)) {
                value = map.get(dim);
                addObject = true;
            }
            //check if the item has parameters
            let parameters = [];
            if (!_.isEmpty(item.parameters)) {
                parameters = this._mergeObjects(item.parameters, map);
                if (!_.isEmpty(parameters)) {
                    addObject = true;
                }
            }
            //check if the item has fields
            let fields = [];
            if (!_.isEmpty(item.fields)) {
                fields = this._mergeObjects(item.fields, map);
                if (!_.isEmpty(fields)) {
                    addObject = true;
                }
            }
            //create the resultant object
            if (addObject) {
                let obj = {
                    name: dim
                };
                if (_.has(item, 'for')) {
                    obj.for = item.for;
                }
                if (_.has(item, 'parents')) {
                    obj.parents = item.parents;
                }
                if (!_.isUndefined(value)) {
                    obj.value = value;
                }
                if (!_.isEmpty(parameters)) {
                    obj.parameters = parameters;
                }
                if (!_.isEmpty(fields)) {
                    obj.fields = fields;
                }
                output.push(obj);
            }
        });
        return output;
    }

    /**
     * Return the list of filter nodes, plus their descendants
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of filter nodes
     * @private
     */
    _getFilterNodes (idCdt, mergedCdt) {
        const startTime = process.hrtime();
        return this
            ._getNodes('filter', mergedCdt, false)
            .then(filter => {
                return [filter, this._getDescendants(idCdt, filter)];
            })
            .spread((filter, descendants) => {
                return _.concat(filter, descendants);
            })
            .finally(() => {
                if (debug) {
                    metrics.record('getFilterNodes', startTime);
                }
            });
    }

    /**
     * Return the list of ranking nodes, plus their descendants
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of ranking nodes
     * @private
     */
    _getRankingNodes (idCdt, mergedCdt) {
        const startTime = process.hrtime();
        return this
            ._getNodes('ranking', mergedCdt, false)
            .then(ranking => {
                return [ranking, this._getDescendants(idCdt, ranking)];
            })
            .spread((ranking, descendants) => {
                return _.concat(ranking, descendants);
            })
            .finally(() => {
                if (debug) {
                    metrics.record('getRankingNodes', startTime);
                }
            });
    }

    /**
     * The list of parameter nodes. Are also taken into account the specific nodes
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of parameter nodes
     * @private
     */
    _getParameterNodes (mergedCdt) {
        const startTime = process.hrtime();
        return Promise
            .join(
                this._getNodes('parameter', mergedCdt, false),
                this._getNodes('parameter', mergedCdt, true),
                (parameterNodes, specificNodes) => {
                    return _.concat(parameterNodes, specificNodes);
                })
            .finally(() => {
                if (debug) {
                    metrics.record('getParameterNodes', startTime);
                }
            });
    }

    /**
     * Return the list of specific nodes.
     * It assumes that the specific nodes belong to the ranking category
     * @param {Object} mergedCdt The list of items (the merged CDT)
     * @returns {Array} The list of specific nodes
     * @private
     */
    _getSpecificNodes (mergedCdt) {
        const startTime = process.hrtime();
        return this
            ._getNodes('ranking', mergedCdt, true)
            .finally(() => {
                if (debug) {
                    metrics.record('getSpecificNodes', startTime);
                }
            });
    }

    /**
     * Find the nodes that belong to the specified type.
     * The valid types are: filter, ranking and parameter.
     * The parameter attached to a dimension are flattened to the root level.
     * Instead, the internal fields of a parameter are leave as they are.
     * This function doesn't take into account the dimensions that are labelled as specific, except when the specific flag is not set.
     * @param {String} type - The type of nodes
     * @param {Array} items - The list of item (the merged CDT)
     * @param {Boolean} specificFlag - If true it searches for specific nodes
     * @returns {Array} The list of nodes found
     * @private
     */
    _getNodes (type, items, specificFlag) {
        if (_.isEqual(type, 'filter') || _.isEqual(type, 'ranking') || _.isEqual(type, 'parameter')) {
            if (!_.isUndefined(items) && !_.isEmpty(items)) {
                //filter the items that belongs to the selected category
                items = _.filter(items, item => {
                    return _.includes(item.for, type);
                });
                let list = [];
                let index = 0;
                //according to the value of the specific flag, select or discard the specific nodes
                //a parameter with multiple fields defined it's considered as specific
                if (specificFlag) {
                    //consider only the specific nodes (the parameter items are flattened to the root)
                    _.forEach(_.filter(items, 'parameters'), item => {
                        _.forEach(item.parameters, p => {
                            if (_.has(p, 'fields') && !_.isEmpty(p.fields)) {
                                list[index++] = p;
                            }
                        });
                    });
                } else {
                    //reject the specific nodes
                    //the dimension and parameter nodes are flattened to the root
                    _.forEach(items, item => {
                        if (_.has(item, 'value')) {
                            list[index++] = item;
                        } else if (_.has(item, 'parameters')) {
                            _.forEach(item.parameters, p => {
                                if (!_.has(p, 'fields')) {
                                    list[index++] = p;
                                }
                            });
                        }
                    });
                }
                return Promise
                    .map(list, item => {
                        //return the value
                        if (_.has(item, 'value')) {
                            return {
                                name: item.dimension || item.name,
                                value: item.value
                            };
                            //if the parameter has fields, return them without modifications
                        } else if (_.has(item, 'fields')) {
                            return {
                                name: item.name,
                                fields: item.fields
                            };
                        }
                    })
                    //merge the various list
                    .reduce((a, b) => {
                        let results = [];
                        if (_.isArray(a)) {
                            results = a;
                        } else {
                            results.push(a);
                        }
                        results.push(b);
                        return results;
                    })
                    .then(results => {
                        if (_.isUndefined(results)) {
                            return [];
                        }
                        if (!_.isArray(results)) {
                            return [results];
                        }
                        return results;
                    });
            } else {
                return Promise.reject('No items selected');
            }
        } else {
            return Promise.reject('Invalid type selected');
        }
    }

    /**
     * Search the selected interest topic
     * @param {Object} mergedCdt - The merged CDT
     * @returns {String} The interest topic name
     * @private
     */
    _getInterestTopic (mergedCdt) {
        const startTime = process.hrtime();
        return new Promise((resolve, reject) => {
            let context = mergedCdt.context;
            if (!_.isEmpty(context)) {
                let r = _.find(context, {name: 'InterestTopic'});
                if (!_.isUndefined(r)) {
                    if (debug) {
                        metrics.record('getInterestTopic', startTime);
                    }
                    resolve(r.value);
                } else {
                    reject('No interest topic selected');
                }
            } else {
                reject('No context selected');
            }
        });
    }

    /**
     * Return the support service categories to be researched
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of categories
     * @private
     */
    _getSupportServiceCategories (mergedCdt) {
        const startTime = process.hrtime();
        return new Promise (resolve => {
            let support = mergedCdt.support;
            if (!_.isEmpty(support)) {
                let categories = _.map(_.filter(support, 'category'), s => {
                    return s.category;
                });
                if (debug) {
                    metrics.record('getSupportServiceCategories', startTime);
                }
                resolve(categories);
            } else {
                resolve();
            }
        });
    }

    /**
     * Return the support service names
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of services name and operation
     * @private
     */
    _getSupportServiceNames (mergedCdt) {
        const startTime = process.hrtime();
        return new Promise (resolve => {
            let support = mergedCdt.support;
            if (!_.isEmpty(support)) {
                let names = _.map(_.filter(support, 'name' && 'operation'), s => {
                    return s;
                });
                if (debug) {
                    metrics.record('getSupportServiceNames', startTime);
                }
                resolve(names);
            } else {
                resolve();
            }
        });
    }

    /**
     * Search all the son nodes of the specified nodes.
     * These nodes must have at least the 'value' attribute defined.
     * @param {ObjectId} idCDT The CDT identifier
     * @param {Array} nodes The parent nodes
     * @returns {Array} The list of son nodes, formatted in name and value
     * @private
     */
    _getDescendants (idCDT, nodes) {
        const startTime = process.hrtime();
        return new Promise ((resolve, reject) => {
            //check if the CDT identifier is defined
            if (_.isUndefined(idCDT)) {
                reject('CDT identifier not defined');
            }
            //if the node list is empty return
            if (_.isUndefined(nodes) || _.isEmpty(nodes)) {
                resolve([]);
            }
            provider
                .getNodeDescendants(idCDT, nodes)
                .then(results => {
                    let output = [];
                    if (!_.isUndefined(results) && !_.isEmpty(results)) {
                        _.forEach(results[0].context, c => {
                            _.forEach(c.values, v => {
                                output.push({
                                    name: c.name,
                                    value: v
                                });
                            });
                        });
                    }
                    resolve(output);
                })
                .finally(() => {
                    if (debug) {
                        metrics.record('getDescendants', startTime);
                    }
                });
        });
    }
}