'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'
import {
    SoundEx,
    DiceCoefficient
} from 'natural'

import Metrics from '../utils/MetricsUtils'

/**
 * This class performs the necessary operations on the information received by the services. In particular two tasks are involved:
 * 1) duplicate detection: check the dataset to search duplicate entities. If some duplicates are found they will be merged in a unique item
 * 2) scoring: WIP
 */
export default class {

    constructor () {
        //this threshold is used for identify a pair of items as similar. Greater value is better (0.9 means 90% similarity)
        this._threshold = 0.85
        if (config.has('similarity.threshold')) {
            this._threshold = config.get('similarity.threshold')
        }
        //initialize debug flag
        this._debug = false
        if (config.has('debug')) {
            this._debug = config.get('debug')
        }
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
     * It calls the necessary methods for cleaning the data received from the services.
     * @param {Object} response - The object coming from the QueryHandler component
     * @returns {Promise<Object>} It returns back the same Object received, with the cleaned list of items
     */
    prepareResponse (response) {
        return new Promise (resolve => {
            if (!_.isUndefined(response) && !_.isEmpty(response.results)) {
                //analyze the result set to find duplicate items and merge them
                response.results = this._findSimilarities(response.results)
            }
            resolve(response)
        })
    }

    /**
     * Find similar items.
     * It first creates clusters of probable similar items using their phonetics as key, with SoundEx algorithm on the 'title' attribute.
     * Then in depth pairwise comparisons are made inside each cluster to find similar objects.
     * If similar objects are found they will be merged in one single item.
     * @param {Array} items - The list of items
     * @returns {Array} The list of items without duplicates (the duplicate items are merged in a unique item)
     * @private
     */
    _findSimilarities (items) {
        const startTime = process.hrtime()
        //create a map of items that sounds similar (using SoundEx algorithm)
        let clusters = new Map()
        _(items).forEach(item => {
            const phonetic = SoundEx.process(item.title)
            if (clusters.has(phonetic)) {
                //add the current item to the cluster
                clusters.get(phonetic).push(item)
            } else {
                //create new entry (casted as array)
                clusters.set(phonetic, [item])
            }
        })
        //scan the clusters and perform merge if similar items are found
        let output = []
        clusters.forEach(items => {
            if (items.length > 1) {
                //doing comparisons between each item belonging to the current cluster
                let i = 0
                let len = items.length
                while (i < len) {
                    let j = i + 1
                    while (j < len) {
                        //calculate the similarity index
                        const sim = this._calculateObjectSimilarity(items[i], items[j])
                        //if the similarity is greater or equal of the threshold, then merge the two items
                        if (sim >= this._threshold) {
                            if (this._debug) {
                                console.log('Found similar items \'' + items[i].title + '\' and \'' + items[j].title + '\' (' + sim + ')')
                            }
                            //merge the two items
                            if (items[i].meta.rank >= items[j].meta.rank) {
                                items[i] = this._mergeItems(items[i], items[j])
                                //delete the item from array
                                items.splice(j, 1)
                            } else {
                                items[j] = this._mergeItems(items[j], items[i])
                                //delete the item from array
                                items.splice(i, 1)
                                j = i + 1
                            }
                            len -= 1
                        } else {
                            j++
                        }
                    }
                    //add the current item to the response
                    output.push(items[i])
                    i++
                }
            } else {
                //add the item to the response
                output.push(items[0])
            }
        })
        if (this._metricsFlag) {
            this._metrics.record('ResponseAggregator', 'findSimilarities', 'MAIN', startTime)
        }
        return output
    }

    /**
     * Perform a similarity check of two objects based on attributes that they have in common.
     * Only string values are taken into account.
     * It uses the Dice Coefficient as similarity index algorithm.
     * @param {Object} obj1 - The first object
     * @param {Object} obj2 - The second object
     * @returns {Number} The similarity index of the two objects
     * @private
     */
    _calculateObjectSimilarity (obj1, obj2) {
        //take into account only the attributes in common for both the objects
        let intersect = _.intersection(_.keysIn(obj1), _.keysIn(obj2))
        let count = 0
        let similaritySum = _(intersect).reduce((sum, i) => {
            //consider only string values
            if (_.isString(obj1[i]) && _.isString(obj2[i])) {
                count++
                //calculate the similarity index for the attribute's pair and sum to the accumulator
                return sum + DiceCoefficient(obj1[i], obj2[i])
            } else {
                return sum
            }
        }, 0)
        //compute the final similarity dividend by the count of attributes taken into account
        return similaritySum / count
    }

    /**
     * Merge the items into a new one. It takes the primary item as base, then add the attributes that are contained only in the secondary item
     * @param {Object} primary - The primary item
     * @param {Object} secondary - The secondary item
     * @returns {Object} The merged object
     * @private
     */
    _mergeItems (primary, secondary) {
        const primaryKeys = _.keys(primary)
        const secondaryKeys = _.keys(secondary)
        const toAdd = _.difference(secondaryKeys, _.intersection(primaryKeys, secondaryKeys))
        let obj = _.cloneDeep(primary)
        _(toAdd).forEach(item => {
           obj[item] = secondary[item]
        })
        obj.meta.name = _.union(primary.meta.name, secondary.meta.name)
        return obj
    }
}