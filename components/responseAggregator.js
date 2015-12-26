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
                let response = _.flatten(this._findSimilarities(responses));
                resolve(response);
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
        //analyze all pairs of responses
        for (let i = 0; i < responses.length - 1; i++) {
            for (let j = i + 1; j < responses.length; j++) {
                //compare every items
                for (let a = 0; a < responses[i].length; a++) {
                    for (let b = 0; b < responses[j].length; b++) {
                        //calculate a similarity index
                        if (this._calculateObjectSimilarity(responses[i][a], responses[j][b])) {
                            //merge the two items
                            responses[i][a] = _.assign(responses[j][b], responses[i][a]);
                            //delete the item from the second array
                            responses[j].splice(b, 1);
                            //if I found a similar item I skip the analysis of the rest of array
                            break;
                        }
                    }
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