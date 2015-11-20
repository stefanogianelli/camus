var _ = require('lodash');
var Promise = require('bluebird');
var util = require('util');

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

module.exports = new contextManager();