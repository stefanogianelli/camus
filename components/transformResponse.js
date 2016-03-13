'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'

import Metrics from '../utils/MetricsUtils'

/**
 * This class handle the trasformation of the results received from the service in the internal format, based on association with the semantic terms
 */
export default class {

    constructor () {
        //initialize metrics utility
        this._metricsFlag = false
        if (config.has('metrics')) {
            this._metricsFlag = config.get('metrics')
        }
        this._metrics = null
        if (this._metricsFlag) {
            this._metrics = Metrics.getInstance()
        }
    }

    /**
     * It transforms the response of the service to make it in internal representation
     * @param {Object} response - The response from the service
     * @param {Object} descriptor - The service's descriptor
     * @returns {Promise<Array>} The transformed list of items
     */
    mappingResponse (response, descriptor) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            if (_.isUndefined(response)) {
                reject('Empty response. Please add a response to be mapped')
            }
            if (_.isUndefined(descriptor)) {
                reject('No descriptor defined. Please add a descriptor for the current service')
            }
            if (_.isUndefined(descriptor.responseMapping)) {
                reject('No mapping defined. Please add a mapping for the current service')
            }
            try {
                //retrieve the base list of items
                const itemList = this._retrieveListOfResults(response, descriptor.responseMapping.list)
                //transform each item of the response
                let transformedResponse = []
                _(itemList).forEach(i => {
                    let obj = this._transformItem(i, descriptor)
                    if (!_.isEmpty(obj)) {
                        transformedResponse.push(obj)
                    }
                })
                //execute custom functions on items (if defined)
                transformedResponse = this._executeFunctions(transformedResponse, descriptor)
                if (this._metricsFlag) {
                    this._metrics.record('TransformResponse', 'mappingResponse', 'MAIN', start)
                }
                resolve(transformedResponse)
            } catch (e) {
                reject(e.message)
            }
        })
    }

    /**
     * It retrieve the base path where find the list of result items.
     * If the specified path is not an array it converts it to an array.
     * @param {Object} response - The response received from the web service
     * @param {String} listItem - The base path where find the items. If the root of the document is the base path leave this field empty
     * @returns {Array} The list of items, as received from the service
     * @private
     */
    _retrieveListOfResults (response, listItem) {
        if (_.isUndefined(response)) {
            throw new Error('Empty response. Please add a response to be mapped')
        }
        let list = []
        if (!_.isUndefined(listItem)) {
            //it was defined a base list item so consider it as root for the transformation
            list = this._getItemValue(response, listItem)
        } else {
            //start at the root element
            list = response
        }
        //check if the current list is an array, otherwise I transform it in a list from the current set of objects
        if (!_.isArray(list)) {
            if (_.isObject(list)) {
                return _(list)
                    .map(item => {
                        return item
                    })
                    .value()
            } else {
                return []
            }
        } else {
            return list
        }
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
     * @param {Object} item - The item where to search the key
     * @param {String} key - The key to be searched. Dot notation is supported
     * @returns {String} The value found, otherwise returns null
     * @private
     */
    _getItemValue (item, key) {
        if (_.isUndefined(item)) {
            return null
        }
        if (_.isEmpty(key) || _.isUndefined(key)) {
            return null
        }
        let keys = key.split('.')
        let value = item
        _(keys).forEach(k => {
            if (!_.isUndefined(value)) {
                value = value[k]
            } else {
                return null
            }
        })
        return value
    }

    /**
     * Transform a single item in the new representation.
     * @param {Object} item - The original item
     * @param {Object} descriptor - The service descriptor that contains the mapping rules
     * @returns {Object} The transformed object
     * @private
     */
    _transformItem (item, descriptor) {
        let obj = {}
        _(descriptor.responseMapping.items).forEach(m => {
            if (_.isString(m.path) && !_.isEmpty(m.path)) {
                let v = this._getItemValue(item, m.path)
                if (!_.isUndefined(v) && !this._isInvalidValue(v)) {
                    obj[m.termName] = v
                }
            }
        })
        if (!_.isEmpty(obj)) {
            obj.meta = {
                name: [descriptor.service.name],
                rank: descriptor.service.rank
            }
        }
        return obj
    }

    /**
     * Execute custom function on attributes
     * @param {Array} items - The list of transformed items
     * @param {Object} descriptor - The service's descriptor
     * @returns {Array} The modified list of items
     * @private
     */
    _executeFunctions (items, descriptor) {
        _(descriptor.responseMapping.functions).forEach(f => {
            _(items).forEach(i => {
                if (_(i).has(f.onAttribute)) {
                    try {
                        let fn = new Function('value', f.run)
                        let value = fn(i[f.onAttribute])
                        if (!_.isEmpty(value) && !_.isUndefined(value)) {
                            i[f.onAttribute] = fn(i[f.onAttribute])
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            })
        })
        return items
    }

    /**
     * This function filters out the invalid values from the response
     * @param {String} value - The value to be checked
     * @returns {Boolean} True if it's invalid, false otherwise
     * @private
     */
    _isInvalidValue (value) {
        return _.isEqual(value, null) || _.isEqual(value, '')
    }
}