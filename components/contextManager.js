var _ = require('lodash');
var Promise = require('bluebird');
var util = require('util');
var cdtModel = require('../models/cdtDescription.js');

Promise.promisifyAll(cdtModel);

var contextManager = function () { };

/**
 * Retrieve the nodes of the CDT that are used for Service selection
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getFilterNodes = function getFilterNodes (contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
            var context = contextFile.context;
            if (!_.isEmpty(context)) {
                var params = [];
                _.forEach(context, function (item) {
                    if (_.has(item, 'for')) {
                        if (item['for'] === 'filter' || item['for'] === 'filter|parameter')
                            if (!_.has(item, 'search') && !_.has(item, 'supportCategory')) {
                                params.push({
                                    dimension: item.dimension,
                                    value: item.value
                                });
                            }
                    } else {
                        reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                    }

                });
                resolve(params);
            } else {
                reject('No context selected');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Retrieve the CDT nodes that uses a specific method for Service selection
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getSpecificNodes = function getSpecificNodes (contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
            var context = contextFile.context;
            if (!_.isEmpty(context)) {
                var params = [];
                _.forEach(context, function (item) {
                    if (_.has(item, 'for')) {
                        if (item['for'] === 'filter' || item['for'] === 'filter|parameter')
                            if (_.has(item, 'search') && !_.has(item, 'supportCategory')) {
                                params.push({
                                    dimension: item.dimension,
                                    value: item.value,
                                    search: item.search
                                });
                            }
                    } else {
                        reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                    }

                });
                resolve(params);
            } else {
                reject('No context selected');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Retrieve the nodes of the CDT that are used for query composition
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getParameterNodes = function getParameterNodes (contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
            var context = contextFile.context;
            if (!_.isEmpty(context)) {
                var params = [];
                _.forEach(context, function (item) {
                    if (_.has(item, 'for')) {
                        if (item['for'] === 'parameter' || item['for'] === 'filter|parameter') {
                            var obj = {
                                dimension: item.dimension,
                                value: item.value
                            };
                            if (_.has(item, 'transformFunction')) {
                                obj['transformFunction'] = item.transformFunction;
                            }
                            params.push(obj);
                        }
                    } else {
                        reject('Lack of attribute \'for\' in item ' + util.inspect(item, false, null));
                    }
                });
                resolve(params);
            } else {
                reject('No context selected');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Search the selected interest topic
 * @param contextFile The current context
 * @returns The interest topic name
 */
contextManager.prototype.getInterestTopic = function getInterestTopic (contextFile) {
    if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
        var context = contextFile.context;
        if (!_.isEmpty(context)) {
            var r = _.find(context, {dimension: 'InterestTopic'});
            if (!_.isUndefined(r) && !_.isNull(r)) {
                return r.value;
            } else {
                throw new Error('No interest topic selected');
            }
        } else {
            throw new Error('No context selected');
        }
    } else {
        throw new Error('No context selected');
    }
};

/**
 * Return the support service categories to be researched
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The list of categories
 */
contextManager.prototype.getSupportServiceCategories = function getSupportServiceCategories (contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'support')) {
            var support = contextFile.support;
            if (!_.isEmpty(support)) {
                var categories = [];
                _.forEach(support, function (s) {
                   if (_.has(s, 'category')) {
                       categories.push(s.category);
                   }
                });
                resolve(categories);
            } else {
                reject('No support services defined');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Return the support service names
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The list of services name and operation
 */
contextManager.prototype.getSupportServiceNames = function getSupportServiceNames (contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'support')) {
            var support = contextFile.support;
            if (!_.isEmpty(support)) {
                var names = [];
                _.forEach(support, function (s) {
                    if (_.has(s, 'name') && _.has(s, 'operation') ) {
                        names.push(s);
                    }
                });
                resolve(names);
            } else {
                reject('No support services defined');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Search the dimension node that is the primary dimension for the support service category specified
 * @param category The support service category
 * @param contextFile The current context
 * @returns {bluebird|exports|module.exports} The dimension and value of the node
 */
contextManager.prototype.getSupportServicePrimaryDimension = function getSupportServicePrimaryDimension (category, contextFile) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
            if (!_.isUndefined(category) && !_.isNull(category) && !_.isEmpty(category)) {
                var context = contextFile.context;
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
            } else {
                reject('No category selected');
            }
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Search all the son nodes of the specified node
 * @param idCDT The CDT identifier
 * @param nodeName The parent node name
 * @returns {*} The list of son nodes, formatted in dimension and value
 */
contextManager.prototype.getDescendants = function getDescendants (idCDT, nodeName) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(idCDT)) {
            if (!_.isUndefined(nodeName) && _.isString(nodeName)) {
                cdtModel
                    .findAsync(
                        {_id: idCDT, 'context.parents': nodeName},
                        {context: {$elemMatch: {parents: nodeName}}}
                    )
                    .then(function (nodes) {
                        var output = [];
                        _.forEach(nodes[0].context, function (c) {
                            _.forEach(c.values, function (v) {
                                output.push({
                                    dimension: c.name,
                                    value: v
                                });
                            });
                        });
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
 * @param contextFile The current context object
 * @returns {boolean} Return true if the dimension is defined, false otherwise
 */
contextManager.prototype.isDefined = function isDefined (dimensionName, contextFile) {
    if (!_.isUndefined(dimensionName) && _.isString(dimensionName)) {
        if (!_.isUndefined(contextFile) && !_.isNull(contextFile) && _.has(contextFile, 'context')) {
            if(_.findIndex(contextFile.context, {dimension: dimensionName}) !== -1) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('No context selected');
        }
    } else {
        throw new Error('Empty or wrong dimension name');
    }
};

module.exports = new contextManager();