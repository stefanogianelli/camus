var _ = require('lodash');
var Promise = require('bluebird');

var transformResponse = function () { };

/**
 * It transforms the response of the service to make it in internal representation
 * @param mapping The mapping rules for the specific service
 * @param response The response from the service
 * @returns {bluebird|exports|module.exports}
 */
transformResponse.prototype.mappingResponse = function mappingResponse (mapping, response) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(response) && _.isObject(response)) {
            if (!_.isUndefined(mapping)) {
                var transformedResponse = _.map(transformResponse.prototype._retrieveListOfResults(response, mapping.list), function (i) {
                    return transformResponse.prototype._transformItem(i, mapping);
                });
                transformedResponse = transformResponse.prototype._executeFunctions(transformedResponse, mapping);
                //clean the response from empty objects
                transformedResponse = _(transformedResponse)
                    .filter(function (item) {
                        return !_.isUndefined(item) && !_.isEmpty(item);
                    })
                    .value();
                resolve(transformedResponse);
            } else {
                reject('no mapping associated to the service');
            }
        } else {
            reject('wrong response type or empty response');
        }
    })
};

/**
 * It retrieve the base path where find the list of result items.
 * If the specified path is not an array it converts it to an array.
 * @param response The response received from the web service
 * @param listItem The base path where find the items. If the root of the document if the base path leave this field empty
 * @returns {Array} The array of items
 */
transformResponse.prototype._retrieveListOfResults = function _retrieveListOfResults (response, listItem) {
    var list = [];
    if (!_.isUndefined(listItem) && !_.isEmpty(listItem)) {
        //it was defined a base list item so consider it as root for the transformation
        list = transformResponse.prototype._getItemValue(response, listItem);
    } else {
        //start at the root element
        list = response;
    }
    //check if the current list is an array, otherwise I transform it in a list from the current set of objects
    if (!_.isArray(list)) {
        list = _.map(list, function(item) {
            return item;
        });
    }
    return list;
};

/**
 * Retrieve the value associated to a key
 * The key must be written in dot notation
 * Es.:
 * {
 *   'a': {
 *     'b': 'test'
 *   }
 * }
 * key = a.b --> test
 * @param item The item where to search the key
 * @param key The key to be searched. Write it in dot notation
 * @returns {*} The value found or null
 */
transformResponse.prototype._getItemValue = function _getItemValue (item, key) {
    if (_.isUndefined(item)) {
        return null;
    }
    if (_.isEmpty(key) || _.isUndefined(key)) {
        return null;
    }
    var keys = key.split('.');
    var value = item;
    _.forEach(keys, function (k) {
        if (!_.isUndefined(value)) {
            value = value[k];
        } else {
            return null;
        }
    });
    return value;
};

/**
 * Tranform a single item in the new representation
 * @param item The original item
 * @param mapping The mapping rules
 * @returns {{}} The transformed object
 */
transformResponse.prototype._transformItem = function _transformItem (item, mapping) {
    var obj = {};
    _.forEach(mapping.items, function (m) {
        if (typeof m.path === 'string' && !_.isEmpty(m.path)) {
            var v = transformResponse.prototype._getItemValue(item, m.path);
            if (!_.isUndefined(v) && !_.isEmpty(v)) {
                obj[m.termName] = v;
            }
        }
    });
    return obj;
};

/**
 * Execute custom function on attributes
 * @param items The list of transformed items
 * @param mapping The mapping rules
 * @returns {*} The modified list of items
 */
transformResponse.prototype._executeFunctions = function _executeFunctions (items, mapping) {
    _.forEach(mapping.functions, function (f) {
        _.forEach(items, function (i) {
            if (_.has(i, f.onAttribute)) {
                try {
                    var fn = new Function('value', f.run);
                    var value = fn(i[f.onAttribute]);
                    if (!_.isEmpty(value) && !_.isUndefined(value)) {
                        i[f.onAttribute] = fn(i[f.onAttribute]);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    });
    return items;
};

module.exports = new transformResponse();