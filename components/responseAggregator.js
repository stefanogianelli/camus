'use strict';

import _ from 'lodash';
import similarityUtils from 'clj-fuzzy';
import Promise from 'bluebird';

/**
 * ResponseAggregator
 */
export default class {

    constructor () {
        //this threshold is used for identify a pair of items as similar. Less value are better (0.1 means 90% similarity)
        this._threshold = 0.1;
    }

    /**
     * Remove duplicate items from the responses lists
     * @param responses The list of responses
     * @returns {bluebird|exports|module.exports} The aggregated and cleaned response
     */
    prepareResponse (responses) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(responses) && !_.isEmpty(responses)) {
                resolve(this._findSimilarities(responses));
            } else {
                //nothing found
                reject('No results');
            }
        });
    }

    /**
     * Check if different arrays contain the same item.
     * When a similar pair is found, the two items are merged and the second instance is removed.
     * @param responses The array that contains all the responses
     * @returns {*} The responses list without duplicate items
     * @private
     */
    _findSimilarities (responses) {
        for (let i = 0; i < responses.length - 1; i++) {
            for (let j = i + 1; j < responses.length; j++) {
                //calculate a similarity index
                if (this._calculateObjectSimilarity(responses[i], responses[j])) {
                    if (!_.isUndefined(responses[i].title)) {
                        console.log('Found similar object: \'' + responses[i].title + '\' and \'' + responses[j].title + '\'');
                    } else {
                        console.log('Found similar object: \'' + responses[i].nome + '\' and \'' + responses[j].nome + '\'');
                    }
                    //merge the two items
                    responses[i] = _.assign(responses[j], responses[i]);
                    //delete the item from the second array
                    responses.splice(j, 1);
                }
            }
        }
        return responses;
    }

    /**
     * Calculate the similarity of two objects.
     * It takes the intersection of common attributes of the two objects. Only string values are take in consideration.
     * It uses the {@link https://en.wikipedia.org/wiki/Jaccard_index|Jaccard Distance} to calculate the strings similarity.
     * To be similar, the calculated index must be less or equal than a predefined threshold.
     * @param obj1 The first object
     * @param obj2 The second object
     * @returns {boolean} True if the two objects are similar, false otherwise
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
                return sum + similarityUtils.metrics.jaccard(obj1[i], obj2[i]);
            } else {
                return sum;
            }
        }, 0);
        //return true if the average similarity is less than the threshold value
        return similaritySum / count <= this._threshold;
    }
}