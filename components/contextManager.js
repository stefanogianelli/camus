var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');

var contextManager = function () { };

/**
 * It takes as input the user's context and transform it into the decorated one.
 * This context is first merged with the full CDT in the database.
 * Decorated CDT mean an object composed in this way:
 * - interestTopic: the interest topic selected
 * - filterNodes: the list of filter nodes (also include the descendants of each node)
 * - rankingNodes: the list of ranking nodes (also include the descendants of each node)
 * - parametersNodes: the list of parameter nodes
 * - supportServiceCategories: the list of categories for which retrieve the support services
 * - supportServiceNames: the list of names and operations for selected the correct support services
 * @param context The user's context
 * @returns {bluebird|exports|module.exports} The decorated CDT
 */
contextManager.prototype.getDecoratedCdt = function getDecoratedCdt (context) {
    return new Promise(function (resolve, reject) {
        contextManager.prototype
            //merge the CDT full description with the values from the user's context
            ._mergeCdtAndContext(context)
            .then(function (mergedCdt) {
                //find the filter nodes (plus their respective descendants)
                Promise
                    .props({
                        //get the interest topic
                        interestTopic: contextManager.prototype._getInterestTopic(mergedCdt),
                        //find the filter nodes (plus their respective descendants)
                        filterNodes: contextManager.prototype._getFilterNodes(mergedCdt)
                            .then(function (filter) {
                                return [filter, contextManager.prototype._getDescendants(context._id, filter)];
                            })
                            .spread(function (filter, descendants) {
                                return _.union(filter, descendants);
                            }),
                        //find the ranking nodes (plus their respective descendants)
                        rankingNodes: contextManager.prototype._getRankingNodes(mergedCdt)
                            .then(function (ranking) {
                                return [ranking, contextManager.prototype._getDescendants(context._id, ranking)];
                            })
                            .spread(function (ranking, descendants) {
                                return _.union(ranking, descendants);
                            }),
                        //find the parameter nodes
                        parameterNodes: contextManager.prototype._getParameterNodes(mergedCdt),
                        //find the support service categories requested
                        supportServiceCategories: contextManager.prototype._getSupportServiceCategories(mergedCdt),
                        //find the support service names and operations requested
                        supportServiceNames: contextManager.prototype._getSupportServiceNames(mergedCdt)
                    })
                    .then(function (results) {
                        //add in the output the CDT identifier
                        results['_id'] = mergedCdt._id;
                        resolve(results);
                    })
                    .catch(function (e) {
                        reject(e);
                    });
            });
    });
};

/**
 * Find the current CDT, filter out the needed dimensions and add the values for the dimension and parameters node from the user context
 * @param context The user context
 * @returns {bluebird|exports|module.exports} The merged CDT
 */
contextManager.prototype._mergeCdtAndContext = function _mergeCdtAndContext (context) {
    return new Promise (function (resolve, reject) {
        provider
            .getCdtDimensions(context._id, _.pluck(context.context, 'dimension'))
            .then(function (data) {
                if (!_.isUndefined(data) && !_.isEmpty(data)) {
                    //associate the values of nodes and parameter to the CDT retrieved
                    var mergedCdt = _.map(data[0].context, function (cdt) {
                        //find in the context the current dimension
                        var c = _.find(context.context, 'dimension', cdt.dimension);
                        //add the value from the context to the decorated item
                        if (!_.isUndefined(c.value)) {
                            cdt['value'] = c.value;
                        }
                        //if the dimension have also some parameters I merge them
                        if (!_.isEmpty(cdt.params) && !_.isEmpty(c.params)) {
                            var params = [];
                            _.forEach(cdt.params, function (p1) {
                                //search the corresponding parameter in the context
                                var p2 = _.find(c.params, 'name', p1.name);
                                //if the parameter is also set in the context I merge them
                                if (!_.isUndefined(p2) && !_.isEmpty(p2)) {
                                    p1['value'] = p2.value;
                                    params.push(p1);
                                }
                            });
                            cdt['params'] = params;
                        }
                        return cdt;
                    });
                    if (_.has(context, 'support')) {
                        resolve({
                            _id: data[0]._id,
                            context: mergedCdt,
                            support: context.support
                        });
                    } else {
                        resolve({
                            _id: data[0]._id,
                            context: mergedCdt
                        });
                    }
                } else {
                    //no data found
                    reject('No context data found');
                }
            });
    });
};

/**
 * Retrieve the filter nodes of the CDT that are used for Service selection.
 * Are also considered the parameters associated to a node.
 * The parameter are translated as dimension and value.
 * @param mergedCdt The merged CDT
 * @returns {bluebird|exports|module.exports} The list of filter nodes
 */
contextManager.prototype._getFilterNodes = function _getFilterNodes (mergedCdt) {
    return new Promise (function (resolve, reject) {
        var context = mergedCdt.context;
        if (!_.isEmpty(context)) {
            //gets the pairs dimension and value from the decorated CDT
            var filterValues = _(context)
                //consider only the filter nodes (also includes filter and parameter nodes)
                //deletes also all the nodes that have parameters associated
                .filter(function (item) {
                    return (item.for === 'filter' || item.for === 'filter|parameter') && _.isEmpty(item.params);
                })
                .map(function (item) {
                    return {
                        dimension: item.dimension,
                        value:item.value
                    };
                })
                .value();
            //map also the values of the parameters inside nodes
            var filterParams = _(context)
                //consider only the filter nodes (also includes filter and parameter nodes) that have at least one parameter defined
                .filter(function (item) {
                    return (item.for === 'filter' || item.for === 'filter|parameter') && !_.isEmpty(item.params);
                })
                .map(function (item) {
                    return _(item.params)
                        .map(function (param) {
                            return {
                                dimension: param.name,
                                value: param.value
                            };
                        })
                        .value();
                })
                .flatten()
                .value();
            //return in output the union of the two previous arrays
            resolve(_.union(filterValues,filterParams));
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Retrieve the ranking nodes of the CDT that are used for Service selection.
 * These nodes are useful for increase the rank of some typology of services (like the local ones).
 * However they cannot exists by themselves, so they must compared with the list of filter nodes to avoid erroneous selections.
 * Are also considered the parameters associated to a node.
 * The parameter are translated as dimension and value.
 * @param mergedCdt The merged CDT
 * @returns {bluebird|exports|module.exports} The list of ranking nodes
 */
contextManager.prototype._getRankingNodes = function _getRankingNodes (mergedCdt) {
    return new Promise (function (resolve, reject) {
        var context = mergedCdt.context;
        if (!_.isEmpty(context)) {
            //gets the pairs dimension and value from the decorated CDT
            var rankingValues = _(context)
            //consider only the ranking nodes (also includes ranking and parameter nodes)
            //deletes also all the nodes that have parameters associated
                .filter(function (item) {
                    return (item.for === 'ranking' || item.for === 'ranking|parameter') && _.isEmpty(item.params);
                })
                .map(function (item) {
                    return {
                        dimension: item.dimension,
                        value:item.value
                    };
                })
                .value();
            //map also the values of the parameters inside nodes
            var rankingParams = _(context)
                //consider only the ranking nodes (also includes ranking and parameter nodes) that have at least one parameter defined
                .filter(function (item) {
                    return (item.for === 'ranking' || item.for === 'ranking|parameter') && !_.isEmpty(item.params);
                })
                .map(function (item) {
                    return _(item.params)
                        .map(function (param) {
                            return {
                                dimension: param.name,
                                value: param.value
                            };
                        })
                        .value();
                })
                .flatten()
                .value();
            //return in output the union of the two previous arrays
            resolve(_.union(rankingValues,rankingParams));
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Retrieve the nodes of the CDT that are used for query composition
 * @param mergedCdt The merged CDT
 * @returns {bluebird|exports|module.exports} The list of parameter nodes
 */
contextManager.prototype._getParameterNodes = function _getParameterNodes (mergedCdt) {
    return new Promise (function (resolve, reject) {
        var context = mergedCdt.context;
        if (!_.isEmpty(context)) {
            //gets the pairs dimension and value from the decorated CDT
            var paramValues = _(context)
                //consider only the parameter nodes (also includes filter or ranking and parameter nodes)
                //deletes also all the nodes that have parameters associated
                .filter(function (item) {
                    return (item.for === 'parameter' || item.for === 'filter|parameter' || item.for === 'ranking|parameter') && _.isEmpty(item.params);
                })
                .map(function (item) {
                    return {
                        dimension: item.dimension,
                        value: item.value
                    };
                })
                .value();
            //map also the values of the parameters inside nodes
            var parameters = _(context)
                //consider only the parameter nodes (also includes filter or ranking and parameter nodes) that have at least one parameter defined
                .filter(function (item) {
                    return (item.for === 'parameter' || item.for === 'filter|parameter' || item.for === 'ranking|parameter') && !_.isEmpty(item.params);
                })
                .map(function (item) {
                    return _(item.params)
                        .map(function (param) {
                            return {
                                dimension: param.name,
                                value: param.value
                            };
                        })
                        .value();
                })
                .flatten()
                .value();

            //return in output the union of the two previous arrays
            resolve(_.union(paramValues, parameters));
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Search the selected interest topic
 * @param mergedCdt The merged CDT
 * @returns The interest topic name
 */
contextManager.prototype._getInterestTopic = function _getInterestTopic (mergedCdt) {
    var context = mergedCdt.context;
    if (!_.isEmpty(context)) {
        var r = _.find(context, {dimension: 'InterestTopic'});
        if (!_.isUndefined(r)) {
            return r.value;
        } else {
            throw new Error('No interest topic selected');
        }
    } else {
        throw new Error('No context selected');
    }
};

/**
 * Return the support service categories to be researched
 * @param mergedCdt The merged CDT
 * @returns {bluebird|exports|module.exports} The list of categories
 */
contextManager.prototype._getSupportServiceCategories = function _getSupportServiceCategories (mergedCdt) {
    return new Promise (function (resolve, reject) {
        var support = mergedCdt.support;
        if (!_.isEmpty(support)) {
            var categories = _.map(_.filter(support, 'category'), function (s) {
                return s.category;
            });
            resolve(categories);
        } else {
            resolve();
        }
    });
};

/**
 * Return the support service names
 * @param mergedCdt The merged CDT
 * @returns {bluebird|exports|module.exports} The list of services name and operation
 */
contextManager.prototype._getSupportServiceNames = function _getSupportServiceNames (mergedCdt) {
    return new Promise (function (resolve, reject) {
        var support = mergedCdt.support;
        if (!_.isEmpty(support)) {
            var names = _.map(_.filter(support, 'name' && 'operation'), function (s) {
               return s;
            });
            resolve(names);
        } else {
            resolve();
        }
    });
};

/**
 * Search all the son nodes of the specified nodes.
 * These nodes must have at least the 'value' attribute defined.
 * @param idCDT The CDT identifier
 * @param nodes The parent nodes
 * @returns {*} The list of son nodes, formatted in dimension and value
 */
contextManager.prototype._getDescendants = function _getDescendants (idCDT, nodes) {
    return new Promise (function (resolve, reject) {
        //start the searching only if at least one node is specified
        if (!_.isUndefined(nodes) && !_.isEmpty(nodes)) {
            provider
                .getNodeDescendants(idCDT, nodes)
                .then(function (results) {
                    var output = [];
                    if (!_.isUndefined(results) && !_.isEmpty(results)) {
                        _.forEach(results[0].context, function (c) {
                            _.forEach(c.values, function (v) {
                                output.push({
                                    dimension: c.dimension,
                                    value: v
                                });
                            });
                        });
                    }
                    resolve(output);
                })
                .catch(function (e) {
                    reject(e);
                });
        } else {
            resolve();
        }
    });
};

module.exports = new contextManager();