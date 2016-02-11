'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'
import {
    SoundEx,
    DiceCoefficient
} from 'natural'

import Metrics from '../utils/MetricsUtils'

let debug = false
if (config.has('debug')) {
    debug = config.get('debug')
}

let metricsFlag = false
if (config.has('metrics')) {
    metricsFlag = config.get('metrics')
}

let metrics = null
if (metricsFlag) {
    metrics = Metrics.getInstance()
}

/**
 * ResponseAggregator
 */
export default class {

    constructor () {
        //this threshold is used for identify a pair of items as similar. Greater value is better (0.9 means 90% similarity)
        if (config.has('similarity.threshold')) {
            this._threshold = config.get('similarity.threshold')
        } else {
            this._threshold = 0.85
        }
    }

    /**
     * Remove duplicate items from the response list
     * @param response The list of items
     * @returns {bluebird|exports|module.exports} The aggregated and cleaned response
     */
    prepareResponse (response) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(response) && !_.isEmpty(response)) {
                resolve(this._findSimilarities(response))
            } else {
                //nothing found
                reject('No results')
            }
        })
    }

    /**
     * Find similar items.
     * It first creates clusters of probable similar items using their phonetics as key, with SoundEx algorithm on the 'title' attribute.
     * Then in depth pairwise comparisons are made inside each cluster to find similar objects.
     * If similar objects are found they will be merged in one single item.
     * @param response The list of items
     * @returns {Array} The list of items without duplicates (the duplicate items are merged in a unique item)
     * @private
     */
    _findSimilarities (response) {
        const startTime = process.hrtime()
        //create a map of items that sounds similar (using SoundEx algorithm)
        let clusters = new Map()
        _.forEach(response, item => {
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
                            if (debug) {
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
        if (metricsFlag) {
            metrics.record('ResponseAggregator', 'findSimilarities', startTime)
        }
        return output
    }

    /**
     * Perform a similarity check of two objects based on attributes that they have in common.
     * Only string values are taken into account.
     * It uses the Dice Coefficient as similarity index algorithm.
     * @param obj1 The first object
     * @param obj2 The second object
     * @returns {number} The similarity index of the two objects
     * @private
     */
    _calculateObjectSimilarity (obj1, obj2) {
        //take into account only the attributes in common for both the objects
        let intersect = _.intersection(_.keysIn(obj1), _.keysIn(obj2))
        let count = 0
        let similaritySum = _.reduce(intersect, (sum, i) => {
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
        _.forEach(toAdd, item => {
           obj[item] = secondary[item]
        })
        obj.meta.name = _.union(primary.meta.name, secondary.meta.name)
        return obj
    }
}