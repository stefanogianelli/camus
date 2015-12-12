'use strict';

let _ = require('lodash');
let Promise = require('bluebird');
let provider = require('../provider/provider.js');
let Provider = new provider();

class ContextManager {

    constructor () {
        //List of dimensions that needs a specific search
        this._specificDimensions = ['Location'];
    }

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
     * @returns {bluebird|exports|module.exports} The decorated CDT
     */
    getDecoratedCdt (context) {
        return new Promise((resolve, reject) => {
            this
                //merge the CDT full description with the values from the user's context
                ._mergeCdtAndContext(context)
                .then((mergedCdt) => {
                    //find the filter nodes (plus their respective descendants)
                    Promise
                        .props({
                            //get the interest topic
                            interestTopic: ContextManager._getInterestTopic(mergedCdt),
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
                            supportServiceNames: this._getSupportServiceNames(mergedCdt)
                        })
                        .then(results => {
                            //add in the output the CDT identifier
                            results['_id'] = mergedCdt._id;
                            resolve(results);
                        })
                        .catch(e => {
                            reject(e);
                        });
                });
        });
    }

    /**
     * Find the current CDT and add values for the dimension and parameters node from the user context
     * @param context The user context
     * @returns {bluebird|exports|module.exports} The merged CDT
     * @private
     */
    _mergeCdtAndContext (context) {
        return new Promise (resolve => {
            Provider
                .getCdt(context._id)
                .then(cdt => {
                    let mergedCdt = [];
                    //merge the dimensions
                    _.forEach(context.context, c => {
                        let cdtItem = _.find(cdt.context, {name: c.dimension});
                        if (!_.isUndefined(cdtItem)) {
                            let obj = {
                                dimension: cdtItem.name,
                                for: cdtItem.for
                            };
                            //add the support service category, if defined
                            if (!_.isUndefined(cdtItem.supportCategory)) {
                                obj['supportCategory'] = cdtItem.supportCategory;
                            }
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
            ._getNodes('filter', mergedCdt, true)
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
            ._getNodes('ranking', mergedCdt, true)
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
                this._getNodes('parameter', mergedCdt, true),
                this._getNodes('parameter', mergedCdt, true, true),
                (parameterNodes, specificNodes) => {
                    return _.union(parameterNodes, specificNodes);
                });
    }

    /**
     * Return the list of specific nodes.
     * It assumes that the specific nodes belong to the ranking category
     * @param items The list of items (the merged CDT)
     * @returns {Promise|Request} The list of specific nodes
     * @private
     */
    _getSpecificNodes (items) {
        return this._getNodes('ranking', items, true, true);
    }

    /**
     * Find the nodes that belong to the specified type.
     * The valid types are: filter, ranking and parameter.
     * The parameter attached to a dimension are flattened to the root level.
     * Instead, the internal fields of a parameter are leave as they are.
     * This function doesn't take into account the dimensions that are labelled as specific, except when the specific flag is not set.
     * @param type The type of nodes
     * @param items The list of item (the merged CDT)
     * @param firstStep Flag true if this is the first call to the function
     * @param specificFlag For internal use only. If true search for specific nodes
     * @returns {Promise|Request} The list of nodes found
     * @private
     */
    _getNodes (type, items, firstStep, specificFlag) {
        if (_.isEqual(type, 'filter') || _.isEqual(type, 'ranking') || _.isEqual(type, 'parameter')) {
            if (!_.isUndefined(items)) {
                if (_.isUndefined(specificFlag)) {
                    specificFlag = false;
                }
                //in the first call to the function the items are filtered
                if (firstStep) {
                    items = _.filter(items, item => {
                        return _.includes(item.for, type);
                    });
                    //according to the value of the specific flag, select or discard the specific nodes
                    if (specificFlag) {
                        //consider only the specific nodes
                        items = _.filter(items, item => {
                            return _.includes(this._specificDimensions, item.dimension);
                        });
                    } else {
                        //reject the specific nodes
                        items = _.reject(items, item => {
                            return _.includes(this._specificDimensions, item.dimension);
                        });
                    }
                }
                return Promise
                    .map(items, item => {
                        //recall the function for parsing the parameter
                        if (_.has(item, 'parameters')) {
                            return this._getNodes(type, item.parameters, false);
                        }
                        //return the value
                        if (_.has(item, 'value')) {
                            return {
                                dimension: item.dimension || item.name,
                                value: item.value
                            };
                            //if the parameter has fields, return them without modifications
                        } else if (_.has(item, 'fields')) {
                            return {
                                dimension: item.dimension || item.name,
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
                        if (_.isArray(b)) {
                            results = _.union(results, b);
                        } else {
                            results.push(b);
                        }
                        return results;
                    })
                    .then(results => {
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
     * @returns The interest topic name
     * @private
     */
    static _getInterestTopic (mergedCdt) {
        let context = mergedCdt.context;
        if (!_.isEmpty(context)) {
            let r = _.find(context, {dimension: 'InterestTopic'});
            if (!_.isUndefined(r)) {
                return r.value;
            } else {
                throw new Error('No interest topic selected');
            }
        } else {
            throw new Error('No context selected');
        }
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
            //start the searching only if at least one node is specified
            if (!_.isUndefined(nodes) && !_.isEmpty(nodes)) {
                Provider
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
                    })
                    .catch(e => {
                        reject(e);
                    });
            } else {
                resolve();
            }
        });
    }
}

module.exports = ContextManager;