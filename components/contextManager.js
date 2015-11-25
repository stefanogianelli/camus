var _ = require('lodash');
var Promise = require('bluebird');
var util = require('util');
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
            });
    });
};

/**
 * Retrieve the nodes of the CDT that are used for Service selection.
 * The nodes that are the base dimension for a support service category are not taken into account by this function.
 * Are also considered the parameters associated to a node, except for that ones need a custom search function.
 * The parameter are translated as dimension and value.
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getFilterNodes = function getFilterNodes (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
        if (!_.isEmpty(context)) {
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'filter' || item['for'] === 'filter|parameter') {
                        //the filter nodes that are the base for a support category are evaluated in another function
                        if (!_.has(item, 'supportCategory')) {
                            //the parameters are mapped as dimension and value, instead of name and value
                            if (_.has(item, 'params') && !_.isEmpty(item['params'])) {
                                _.forEach(item.params, function (p) {
                                    //parameter that needs a custom search function are evaluated in another function
                                    if (!_.has(p, 'searchFunction')) {
                                        params.push({
                                            dimension: p.name,
                                            value: p.value
                                        });
                                    }
                                });
                            }
                            //if the node has a value it's considered
                            if (_.has(item, 'value')) {
                                params.push({
                                    dimension: item.dimension,
                                    value: item.value
                                });
                            }
                        }
                    }
                } else {
                    reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                }
            });
            resolve(params);
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Similar to {@link contextManager#getFilterNodes()}, but it take into account only the parameters that need a custom search function.
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getSpecificNodes = function getSpecificNodes (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
        if (!_.isEmpty(context)) {
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'filter' || item['for'] === 'filter|parameter') {
                        //the filter nodes that are the base for a support category are evaluated in another function
                        if (!_.has(item, 'supportCategory')) {
                            //the parameters are mapped as dimension and value, instead of name and value
                            if (_.has(item, 'params') && !_.isEmpty(item['params'])) {
                                _.forEach(item.params, function (p) {
                                    //are considered only the parameters that have a custom serch function specified
                                    if (_.has(p, 'searchFunction')) {
                                        params.push({
                                            dimension: p.name,
                                            value: p.value,
                                            searchFunction: p.searchFunction
                                        });
                                    }
                                });
                            }
                        }
                    }
                } else {
                    reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                }

            });
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
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'parameter' || item['for'] === 'filter|parameter') {
                        if (!_.has(item, 'supportCategory')) {
                            if (_.has(item, 'params') && !_.isEmpty(item['params'])) {
                                _.forEach(item.params, function (p) {
                                    params.push({
                                        dimension: p.name,
                                        value: p.value
                                    });
                                });
                            }
                            if(_.has(item, 'value')) {
                                var obj = {
                                    dimension: item.dimension,
                                    value: item.value
                                };
                                if (_.has(item, 'transformFunction')) {
                                    obj['transformFunction'] = item.transformFunction;
                                }
                                params.push(obj);
                            }
                        }
                    }
                } else {
                    reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                }
            });
            resolve(params);
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
            reject('No support services defined');
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
            reject('No support services defined');
        }
    });
};

/**
 * Search the dimension node that is the primary dimension for the support service category specified
 * @param category The support service category
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The dimension and value of the node
 */
contextManager.prototype.getSupportServicePrimaryDimension = function getSupportServicePrimaryDimension (category, decoratedCdt) {
    return new Promise (function (resolve, reject) {
        var context = decoratedCdt.context;
        if (!_.isEmpty(context)) {
            var param = _.find(context, {supportCategory: category});
            if (!_.isUndefined(param)) {
                resolve(param);
            } else {
                reject('Primary dimension for category \'' + category + '\' not found');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Search all the son nodes of the specified node
 * @param idCDT The CDT identifier
 * @param node The parent node(s)
 * @returns {*} The list of son nodes, formatted in dimension and value
 */
contextManager.prototype.getDescendants = function getDescendants (idCDT, node) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(idCDT)) {
            if (!_.isUndefined(node)) {
                provider
                    .getNodeDescendants(idCDT, node)
                    .then(function (nodes) {
                        var output = [];
                        if(!_.isUndefined(nodes) && !_.isEmpty(nodes)) {
                            _.forEach(nodes[0].context, function (c) {
                                _.forEach(c.values, function (v) {
                                    output.push({
                                        dimension: c.name,
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
                reject('Empty or wrong node name');
            }
        } else {
            reject('Specify a CDT identifier');
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