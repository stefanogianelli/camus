var _ = require('lodash');
var promise = require('bluebird');

var contextManager = function () { };

/**
 * Retrieve the nodes of the CDT that are used for service selection
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of nodes
 */
contextManager.prototype.getFilterNodes = function (context) {
    return new promise (function (resolve, reject) {
        if (context !== null && context.length > 0) {
            var params = [];
            _.forEach(_.filter(context, {'for': 'filter'}), function (i) {
                params.push({
                    dimension : i.dimension,
                    value : i.value
                });
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
contextManager.prototype.getParameterNodes = function (context) {
    return new promise (function (resolve, reject) {
        if (context !== null && context.length > 0) {
            var params = [];
            _.forEach(_.filter(context, {'for': 'parameter'}), function (i) {
                params.push({
                    dimension : i.dimension,
                    value : i.value
                });
            });
            resolve(params);
        } else {
            reject('No context selected');
        }
    });
};

module.exports = new contextManager();