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
 * Check if different arrays contains the same item.
 * When a similar pair is found, the two items are merged and the second instance is removed.
 * @param responses The array that contains all the responses
 * @returns {*} The responses list without duplicate items
 */
responseAggregator.prototype.findSimilarities = function findSimilarities (responses) {
    if (!_.isUndefined(responses) && !_.isEmpty(responses)) {
        for(var i = 0; i < responses.length - 1; i++) {
            for (var j = i + 1; j < responses.length; j++) {
                _.forEach(responses[i], function(obj1, index) {
                    _.forEach(responses[j], function (obj2) {
                        if (responseAggregator.prototype.calculateObjectSimilarity(obj1, obj2)) {
                            responses[i][index] = _.assign(obj2, obj1);
                            _.remove(responses[j], obj2);
                        }
                    })
                });
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
    var similarities = [];
    var intersect = _.intersection(_.keysIn(obj1), _.keysIn(obj2));
    _.forEach(intersect, function(i) {
        if (_.isString(obj1[i]) && _.isString(obj2[i])) {
            similarities.push(similarityUtils.metrics.jaccard(obj1[i].replace(regexp), obj2[i].replace(regexp)));
        }
    });
    var similarity = _.sum(similarities)/similarities.length;
    return similarity <= threshold;
};

module.exports = new responseAggregator();