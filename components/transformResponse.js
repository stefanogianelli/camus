'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

export default class TransformResponse {

    /**
     * It transforms the response of the service to make it in internal representation
     * @param mapping The mapping rules for the specific service
     * @param response The response from the service
     * @returns {bluebird|exports|module.exports}
     */
    mappingResponse (mapping, response) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(response) && _.isObject(response)) {
                if (!_.isUndefined(mapping)) {
                    let transformedResponse = _.map(response, i => {
                        return this._transformItem(i, mapping);
                    });
                    transformedResponse = this._executeFunctions(transformedResponse, mapping);
                    //clean the response from empty objects
                    transformedResponse = _(transformedResponse)
                        .filter(item => {
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
    }

    /**
     * It retrieve the base path where find the list of result items.
     * If the specified path is not an array it converts it to an array.
     * @param response The response received from the web service
     * @param listItem The base path where find the items. If the root of the document if the base path leave this field empty
     * @returns {Promise<T>} The array of items
     */
    retrieveListOfResults (response, listItem) {
        return new Promise(resolve => {
            let list = [];
            if (!_.isUndefined(listItem) && !_.isEmpty(listItem)) {
                //it was defined a base list item so consider it as root for the transformation
                list = this._getItemValue(response, listItem);
            } else {
                //start at the root element
                list = response;
            }
            //check if the current list is an array, otherwise I transform it in a list from the current set of objects
            if (!_.isArray(list)) {
                list = _.map(list, item => {
                    return item;
                });
            }
            resolve(list);
        });
    }

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
     * @private
     */
    _getItemValue (item, key) {
        if (_.isUndefined(item)) {
            return null;
        }
        if (_.isEmpty(key) || _.isUndefined(key)) {
            return null;
        }
        let keys = key.split('.');
        let value = item;
        _.forEach(keys, k => {
            if (!_.isUndefined(value)) {
                value = value[k];
            } else {
                return null;
            }
        });
        return value;
    }

    /**
     * Tranform a single item in the new representation
     * @param item The original item
     * @param mapping The mapping rules
     * @returns {{}} The transformed object
     * @private
     */
    _transformItem (item, mapping) {
        let obj = {};
        _.forEach(mapping.items, m => {
            if (_.isString(m.path) && !_.isEmpty(m.path)) {
                let v = this._getItemValue(item, m.path);
                if (!_.isUndefined(v) && !this._isInvalidValue(v)) {
                    obj[m.termName] = v;
                }
            }
        });
        return obj;
    }

    /**
     * Execute custom function on attributes
     * @param items The list of transformed items
     * @param mapping The mapping rules
     * @returns {*} The modified list of items
     * @private
     */
    _executeFunctions (items, mapping) {
        _.forEach(mapping.functions, f => {
            _.forEach(items, i => {
                if (_.has(i, f.onAttribute)) {
                    try {
                        let fn = new Function('value', f.run);
                        let value = fn(i[f.onAttribute]);
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
    }

    /**
     * This function filters out the invalid values from the response
     * @param value The value to be checked
     * @returns {boolean} True if it's invalid, false otherwise
     * @private
     */
    _isInvalidValue (value) {
        return _.isEqual(value, null) || _.isEqual(value, '');
    }
}