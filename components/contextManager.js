var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');

var contextManager = function () { };

/**
 * Find the current CDT, filter out the needed dimensions and add the values for the dimension and parameters node from the user context
 * @param context The user context
 * @returns {bluebird|exports|module.exports} The decorated CDT
 */
contextManager.prototype.getDecoratedCdt = function getDecoratedCdt (context) {
    return new Promise (function (resolve, reject) {
        provider
            .getCdtDimensions(context._id, _.pluck(context.context, 'dimension'))
            .then(function (data) {
                if (!_.isUndefined(data) && !_.isEmpty(data)) {
                    var decoratedCdt = _.map(data[0].context, function (cdt) {
                        var c = _.find(context.context, 'dimension', cdt.dimension);
                        if (!_.isEmpty(cdt.params) && !_.isEmpty(c.params)) {
                            cdt['params'] = _.map(cdt.params, function (p1) {
                                var p2 = _.find(c.params, 'name', p1.name);
                                return _.assign(p2, p1);
                            });
                        }
                        return _.assign(c, cdt);
                    });
                    if (_.has(context, 'support')) {
                        resolve({
                            _id: data[0]._id,
                            context: decoratedCdt,
                            support: context.support
                        });
                    } else {
                        resolve({
                            _id: data[0]._id,
                            context: decoratedCdt
                        });
                    }
                } else {
                    //no data found
                    resolve();
                }
            });
    });
};

/**
 * Retrieve the nodes of the CDT that are used for Service selection.
 * Are also considered the parameters associated to a node, except for that ones need a custom search function.
 * The parameter are translated as dimension and value.
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getFilterNodes = function getFilterNodes (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
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
                        //remove parameters that need a custom search function
                        .reject(function (item) {
                            return _.has(item, 'searchFunction');
                        })
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
 * Similar to {@link contextManager#getFilterNodes()}, but it takes into account only the parameters that need a custom search function.
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getSpecificNodes = function getSpecificNodes (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
        if (!_.isEmpty(context)) {
            var params = _(context)
                //consider only the filter nodes (also includes filter and parameter nodes) with non-empty parameters list
                .filter(function (item) {
                    return (item.for === 'filter' || item.for === 'filter|parameter')  && !_.isEmpty(item.params);
                })
                .map(function (item) {
                    return _(item.params)
                        //take into account only the parameters that have associated a custom search function
                        .filter(function (item) {
                            return _.has(item, 'searchFunction');
                        })
                        .map(function (param) {
                            return {
                                dimension: param.name,
                                value: param.value,
                                searchFunction: param.searchFunction
                            };
                        })
                        .value();
                })
                .flatten()
                .value();
            resolve(params);
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Retrieve the nodes of the CDT that are used for query composition
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getParameterNodes = function getParameterNodes (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
        if (!_.isEmpty(context)) {
            //gets the pairs dimension and value from the decorated CDT
            var paramValues = _(context)
                //consider only the parameter nodes (also includes filter and parameter nodes)
                //deletes also all the nodes that have parameters associated
                .filter(function (item) {
                    return (item.for === 'parameter' || item.for === 'filter|parameter') && _.isEmpty(item.params);
                })
                .map(function (item) {
                    //add information about the translation function, if exists
                    if (_.has(item, 'transformFunction')) {
                        return {
                            dimension: item.dimension,
                            value: item.value,
                            transformFunction: item.transformFunction
                        };
                    } else {
                        return {
                            dimension: item.dimension,
                            value: item.value
                        };
                    }
                })
                .value();
            //map also the values of the parameters inside nodes
            var parameters = _(context)
                //consider only the parameter nodes (also includes filter and parameter nodes) that have at least one parameter defined
                .filter(function (item) {
                    return (item.for === 'parameter' || item.for === 'filter|parameter') && !_.isEmpty(item.params);
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
 * @param decoratedCdt The decorated CDT
 * @returns The interest topic name
 */
contextManager.prototype.getInterestTopic = function getInterestTopic (decoratedCdt) {
    var context = decoratedCdt.context;
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
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of categories
 */
contextManager.prototype.getSupportServiceCategories = function getSupportServiceCategories (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var support = decoratedCdt.support;
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
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of services name and operation
 */
contextManager.prototype.getSupportServiceNames = function getSupportServiceNames (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var support = decoratedCdt.support;
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
contextManager.prototype.getDescendants = function getDescendants (idCDT, nodes) {
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

/**
 * Check if a specified dimension is defined in the context
 * @param dimensionName The dimension name to be searched
 * @param decoratedCdt The decorated CDT
 * @returns {boolean} Return true if the dimension is defined, false otherwise
 */
contextManager.prototype.isDefined = function isDefined (dimensionName, decoratedCdt) {
    return _.findIndex(decoratedCdt.context, {dimension: dimensionName}) !== -1;
};

module.exports = new contextManager();