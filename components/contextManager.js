var _ = require('lodash');
var Promise = require('bluebird');
var util = require('util');

var contextManager = function () { };

/**
 * Retrieve the nodes of the CDT that are used for Service selection
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getFilterNodes = function getFilterNodes (context) {
    return new Promise (function (resolve, reject) {
        if (context !== null && context.length > 0) {
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'filter' || item['for'] === 'filter|parameter')
                        if (!_.has(item, 'search')) {
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
    });
};

/**
 * Retrieve the CDT nodes that uses a specific method for Service selection
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getSpecificNodes = function getSpecificNodes (context) {
    return new Promise (function (resolve, reject) {
        if (context !== null && context.length > 0) {
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'filter' || item['for'] === 'filter|parameter')
                        if (_.has(item, 'search')) {
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
    });
};

/**
 * Retrieve the nodes of the CDT that are used for query composition
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getParameterNodes = function getParameterNodes (context) {
    return new Promise (function (resolve, reject) {
        if (context !== null && context.length > 0) {
            var params = [];
            _.forEach(context, function (item) {
                if (_.has(item, 'for')) {
                    if (item['for'] === 'parameter' || item['for'] === 'filter|parameter')
                        if (!_.has(item, 'search')) {
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
    });
};

module.exports = new contextManager();