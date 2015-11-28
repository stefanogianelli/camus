var _ = require('lodash');
var similarityUtils = require('clj-fuzzy');
var Promise = require('bluebird');

//regular expression used for delete all the special symbols from the string for the comparison
var regexp = '/[^\w\s]/gi, \'\'';
//this threshold is used for identify a pair of items as similar. Less value are better (0.1 means 90% similarity)
var threshold = 0.1;

var responseAggregator = function () { };

/**
 * Remove duplicate items from the responses lists and append the information for retrieve information by the support services
 * @param responses The list of responses
 * @param supportServices The list of support service descriptions
 * @returns {bluebird|exports|module.exports} The aggregated and cleaned response
 */
responseAggregator.prototype.prepareResponse = function (responses, supportServices) {
    return new Promise (function (resolve, reject) {
        var response = {};
        response['data'] = _.flatten(responseAggregator.prototype.findSimilarities(responses));
        response['support'] = supportServices;
        resolve(response);
    });
};

/**
 * Check if different arrays contain the same item.
 * When a similar pair is found, the two items are merged and the second instance is removed.
 * @param responses The array that contains all the responses
 * @returns {*} The responses list without duplicate items
 */
responseAggregator.prototype.findSimilarities = function findSimilarities (responses) {
    if (!_.isUndefined(responses) && !_.isEmpty(responses)) {
        //analyze all pairs of responses
        for(var i = 0; i < responses.length - 1; i++) {
            for (var j = i + 1; j < responses.length; j++) {
                //compare every items
                for(var a = 0; a < responses[i].length; a++) {
                    for(var b = 0; b < responses[j].length; b++) {
                        //calculate a similarity index
                        if (responseAggregator.prototype.calculateObjectSimilarity(responses[i][a], responses[j][b])) {
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
    } else {
        console.log('Responses array is empty');
    }
};

/**
 * Calculate the similarity of two objects.
 * It takes the intersection of common attributes of the two objects. Only string values are take in consideration.
 * It uses the {@link https://en.wikipedia.org/wiki/Jaccard_index|Jaccard Distance} to calculate the strings similarity.
 * To be similar, the calculated index must be less or equal than a predefined threshold.
 * @param obj1 The first object
 * @param obj2 The second object
 * @returns {boolean} True if the two objects are similar, false otherwise
 */
responseAggregator.prototype.calculateObjectSimilarity = function calculateObjectSimilarity (obj1, obj2) {
    //take into account only the attributes in common for both the objects
    var intersect = _.intersection(_.keysIn(obj1), _.keysIn(obj2));
    var count = 0;
    var similaritySum = _.reduce(intersect, function(sum, i) {
        //consider only string values
        if (_.isString(obj1[i]) && _.isString(obj2[i])) {
            count++;
            //calculate the similarity index for the attribute's pair and sum to the accumulator
            return sum + similarityUtils.metrics.jaccard(obj1[i].replace(regexp), obj2[i].replace(regexp));
        } else {
            return sum;
        }
    }, 0);
    //return true if the average similarity is less than the threshold value
    return similaritySum / count <= threshold;
};

module.exports = new responseAggregator();