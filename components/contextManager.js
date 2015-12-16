'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

import Provider from '../provider/provider.js';

const provider = new Provider();

export default class ContextManager {

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
     * @param context The user's context
     * @returns {Promise|Request|Promise.<T>} The decorated CDT
     */
    getDecoratedCdt (context) {
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
            });
    }

    /**
     * Find the current CDT and add values for the dimension and parameters node from the user context
     * @param context The user context
     * @returns {bluebird|exports|module.exports} The merged CDT
     * @private
     */
    _mergeCdtAndContext (context) {
        return new Promise ((resolve, reject) => {
            provider
                .getCdt(context._id)
                .then(cdt => {
                    //check if the related CDT is found
                    if (!_.isNull(cdt)) {
                        let mergedCdt = [];
                        //merge the dimensions
                        _.forEach(context.context, c => {
                            let cdtItem = _.find(cdt.context, {name: c.dimension});
                            if (!_.isUndefined(cdtItem)) {
                                let obj = {
                                    dimension: cdtItem.name,
                                    for: cdtItem.for
                                };
                                //add the context value, if defined
                                if (_.has(c, 'value')) {
                                    obj['value'] = c.value;
                                }
                                //check if the item have some parameters
                                if (!_.isUndefined(cdtItem.parameters) && _.has(c, 'parameters')) {
                                    obj['parameters'] = this._mergeParameters(cdtItem.parameters, c.parameters);
                                }
                                mergedCdt.push(obj);
                            }
                        });
                        if (_.has(context, 'support')) {
                            resolve({
                                _id: cdt._id,
                                context: mergedCdt,
                                support: context.support
                            });
                        } else {
                            resolve({
                                _id: cdt._id,
                                context: mergedCdt
                            });
                        }
                    } else {
                        reject('No CDT found. Check if the ID is correct');
                    }
                });
        });
    }

    /**
     * Merge the parameters of a single parameter
     * @param cdtParameters The CDT's parameters
     * @param contextParameters The context's parameters
     * @returns {Array} The merged parameters
     * @private
     */
    _mergeParameters (cdtParameters, contextParameters) {
        let parameters = [];
        _.forEach(contextParameters, p => {
            let cdtParam = _.find(cdtParameters, {name: p.name});
            if (!_.isUndefined(cdtParam)) {
                let obj = {
                    name: cdtParam.name
                };
                if (!_.isUndefined(cdtParam.type)) {
                    obj['type'] = cdtParam.type;
                }
                if (_.has(p, 'value')) {
                    obj['value'] = p.value;
                }
                if (!_.isUndefined(cdtParam.fields) && _.has(p, 'fields')) {
                    obj['fields'] = this._mergeFields(cdtParam.fields, p.fields);
                }
                parameters.push(obj);
            }
        });
        return parameters;
    }

    /**
     * Merge the field of a single parameter
     * @param cdtFields The CDT's fields
     * @param contextFields The context's fields
     * @returns {Array} The merged fields
     * @private
     */
    _mergeFields (cdtFields, contextFields) {
        let fields = [];
        _.forEach(contextFields, f => {
            let cdtField = _.find(cdtFields, {name: f.name});
            if (!_.isUndefined(cdtField)) {
                let obj = {
                    name: cdtField.name
                };
                if (_.has(f, 'value')) {
                    obj['value'] = f.value;
                }
                fields.push(obj);
            }
        });
        return fields;
    }

    /**
     * Return the list of filter nodes, plus their descendants
     * @param idCdt The CDT identifier
     * @param mergedCdt The merged CDT
     * @returns {Function|*} The list of filter nodes
     * @private
     */
    _getFilterNodes (idCdt, mergedCdt) {
        return this
            ._getNodes('filter', mergedCdt, false)
            .then(filter => {
                return [filter, this._getDescendants(idCdt, filter)];
            })
            .spread((filter, descendants) => {
                return _.union(filter, descendants);
            });
    }

    /**
     * Return the list of ranking nodes, plus their descendants
     * @param idCdt The CDT identifier
     * @param mergedCdt The merged CDT
     * @returns {Function|*} The list of ranking nodes
     * @private
     */
    _getRankingNodes (idCdt, mergedCdt) {
        return this
            ._getNodes('ranking', mergedCdt, false)
            .then(ranking => {
                return [ranking, this._getDescendants(idCdt, ranking)];
            })
            .spread((ranking, descendants) => {
                return _.union(ranking, descendants);
            });
    }

    /**
     * The list of parameter nodes. Are also taken into account the specific nodes
     * @param mergedCdt The merged CDT
     * @returns The list of parameter nodes
     * @private
     */
    _getParameterNodes (mergedCdt) {
        return Promise
            .join(
                this._getNodes('parameter', mergedCdt, false),
                this._getNodes('parameter', mergedCdt, true),
                (parameterNodes, specificNodes) => {
                    return _.union(parameterNodes, specificNodes);
                });
    }

    /**
     * Return the list of specific nodes.
     * It assumes that the specific nodes belong to the ranking category
     * @param mergedCdt The list of items (the merged CDT)
     * @returns {Promise|Request} The list of specific nodes
     * @private
     */
    _getSpecificNodes (mergedCdt) {
        return this._getNodes('ranking', mergedCdt, true);
    }

    /**
     * Find the nodes that belong to the specified type.
     * The valid types are: filter, ranking and parameter.
     * The parameter attached to a dimension are flattened to the root level.
     * Instead, the internal fields of a parameter are leave as they are.
     * This function doesn't take into account the dimensions that are labelled as specific, except when the specific flag is not set.
     * @param type The type of nodes
     * @param items The list of item (the merged CDT)
     * @param specificFlag If true it searches for specific nodes
     * @returns {Promise|Request} The list of nodes found
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
                                dimension: item.dimension || item.name,
                                value: item.value
                            };
                        //if the parameter has fields, return them without modifications
                        } else if (_.has(item, 'fields')) {
                            return {
                                dimension: item.name,
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
     * @param mergedCdt The merged CDT
     * @returns {bluebird|exports|module.exports} The interest topic name
     * @private
     */
    _getInterestTopic (mergedCdt) {
        return new Promise((resolve, reject) => {
            let context = mergedCdt.context;
            if (!_.isEmpty(context)) {
                let r = _.find(context, {dimension: 'InterestTopic'});
                if (!_.isUndefined(r)) {
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
     * @param mergedCdt The merged CDT
     * @returns {bluebird|exports|module.exports} The list of categories
     * @private
     */
    _getSupportServiceCategories (mergedCdt) {
        return new Promise (resolve => {
            let support = mergedCdt.support;
            if (!_.isEmpty(support)) {
                let categories = _.map(_.filter(support, 'category'), s => {
                    return s.category;
                });
                resolve(categories);
            } else {
                resolve();
            }
        });
    }

    /**
     * Return the support service names
     * @param mergedCdt The merged CDT
     * @returns {bluebird|exports|module.exports} The list of services name and operation
     * @private
     */
    _getSupportServiceNames (mergedCdt) {
        return new Promise (resolve => {
            let support = mergedCdt.support;
            if (!_.isEmpty(support)) {
                let names = _.map(_.filter(support, 'name' && 'operation'), s => {
                    return s;
                });
                resolve(names);
            } else {
                resolve();
            }
        });
    }

    /**
     * Search all the son nodes of the specified nodes.
     * These nodes must have at least the 'value' attribute defined.
     * @param idCDT The CDT identifier
     * @param nodes The parent nodes
     * @returns {*} The list of son nodes, formatted in dimension and value
     * @private
     */
    _getDescendants (idCDT, nodes) {
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
                                    dimension: c.dimension,
                                    value: v
                                });
                            });
                        });
                    }
                    resolve(output);
                });
        });
    }
}