'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import config from 'config';
import {
    SoundEx,
    DiceCoefficient
} from 'natural';

import Metrics from '../utils/MetricsUtils';

const filePath = __dirname.replace('components', '') + '/metrics/ResponseAggregator.txt';
const metrics = new Metrics(filePath);

/**
 * ResponseAggregator
 */
export default class {

    constructor () {
        //this threshold is used for identify a pair of items as similar. Greater value is better (0.9 means 90% similarity)
        if (config.has('similarity.threshold')) {
            this._threshold = config.get('similarity.threshold');
        } else {
            this._threshold = 0.85;
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
                resolve(this._findSimilarities(response));
            } else {
                //nothing found
                reject('No results');
            }
        });
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
        const startTime = Date.now();
        //create a map of items that sounds similar (using SoundEx algorithm)
        let clusters = new Map();
        _.forEach(response, item => {
            const phonetic = SoundEx.process(item.title);
            if (clusters.has(phonetic)) {
                //add the current item to the cluster
                clusters.get(phonetic).push(item);
            } else {
                //create new entry (casted as array)
                clusters.set(phonetic, [item]);
            }
        });
        //scan the clusters and perform merge if similar items are found
        let output = [];
        clusters.forEach(items => {
            if (items.length > 1) {
                //doing comparisons between each item belonging to the current cluster
                let i = 0;
                let len = items.length;
                while (i < len) {
                    let j = i + 1;
                    while (j < len) {
                        //calculate the similarity index
                        const sim = this._calculateObjectSimilarity(items[i], items[j]);
                        //if the similarity is greater or equal of the threshold, then merge the two items
                        if (sim >= this._threshold) {
                            console.log('Found similar items \'' + items[i].title + '\' and \'' + items[j].title + '\' (' + sim + ')');
                            //merge the two items
                            items[i] = _.assign(items[j], items[i]);
                            //delete the item from array
                            items.splice(j, 1);
                            len -= 1;
                        } else {
                            j++;
                        }
                    }
                    //add the current item to the response
                    output.push(items[i]);
                    i++;
                }
            } else {
                //add the item to the response
                output.push(items[0]);
            }
        });
        metrics.record('findSimilarities', startTime, Date.now());
        metrics.saveResults();
        return output;
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
        let intersect = _.intersection(_.keysIn(obj1), _.keysIn(obj2));
        let count = 0;
        let similaritySum = _.reduce(intersect, (sum, i) => {
            //consider only string values
            if (_.isString(obj1[i]) && _.isString(obj2[i])) {
                count++;
                //calculate the similarity index for the attribute's pair and sum to the accumulator
                return sum + DiceCoefficient(obj1[i], obj2[i]);
            } else {
                return sum;
            }
        }, 0);
        //compute the final similarity dividend by the count of attributes taken into account
        return similaritySum / count;
    }
}