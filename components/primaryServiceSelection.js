var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');

//number of services to keep
var N = 3;
//filter nodes weight
var filterWeight = 2;
//ranking nodes weight
var rankingWeight = 4;

var primaryServiceSelection = function () { };

/**
 * Search the services that best fit the current context
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The ordered operations id
 */
primaryServiceSelection.prototype.selectServices = function selectServices (decoratedCdt) {
    return new Promise(function (resolve, reject) {
        Promise
            .props({
                //search for services associated to the filter nodes
                filter: provider.filterPrimaryServices(decoratedCdt.filterNodes, decoratedCdt._id),
                //search for services associated to the ranking nodes
                ranking: provider.filterPrimaryServices(decoratedCdt.rankingNodes, decoratedCdt._id)
            })
            .then(function (results) {
                //discard the ranking nodes that haven't a correspondence in the filter nodes list
                results.ranking = primaryServiceSelection.prototype._intersect(results.filter, results.ranking);
                //add the weight values for each item
                _.forEach(results.filter, function (i) {
                    i['weight'] = filterWeight;
                });
                _.forEach(results.ranking, function (i) {
                    i['weight'] = rankingWeight;
                });
                //calculate the ranking of the merged list
                resolve(primaryServiceSelection.prototype._calculateRanking(_.union(results.filter, results.ranking)));
            })
            .catch(function (e) {
                console.log(e);
                resolve();
            });
    })
};

/**
 * Compute the ranking of each operation found by the previous steps
 * @param services The list of services, with own rank and weight
 * @returns {Array} The ranked list of Top-N services
 */
primaryServiceSelection.prototype._calculateRanking = function _calculateRanking (services) {
    var rankedList = [];
    _.forEach(services, function (s) {
        //calculate the ranking of the current service
        var rank;
        //avoid infinity results
        if (s.ranking > 0) {
            rank = s.weight * (1 / s.ranking);
        } else {
            rank = s.weight;
        }
        //check if the service is already in the list
        var index = _.findIndex(rankedList, function (i) {
            return i._idOperation.equals(s._idOperation);
        });
        if (index === -1) {
            //if not exists creates the entry
            rankedList.push({
                _idOperation: s._idOperation,
                rank: rank
            });
        } else {
            //if exists update the rank
            rankedList[index].rank += rank;
        }
    });
    //sort the list by the rank in descending order
    rankedList = _.sortByOrder(rankedList, 'rank', 'desc');
    //take only the first N services
    _.take(rankedList, N);
    return rankedList;
};

/**
 * Return the intersection of two arrays.
 * The base item for comparison is the Operation Identifier
 * @param array1 The first array
 * @param array2 The second array
 * @returns {Array} The array intersection of the input ones
 */
primaryServiceSelection.prototype._intersect = function _intersect (array1, array2) {
    if (!_.isUndefined(array1) && !_.isUndefined(array2)) {
        var first, second;
        if (array1.length < array2.length) {
            first = array1;
            second = array2;
        } else {
            first = array2;
            second = array1;
        }
        return _.filter(first, function (i) {
            var index = _.findIndex(second, function (s) {
                return s._idOperation.equals(i._idOperation);
            });
            return index !== -1;
        });
    }
};

module.exports = new primaryServiceSelection();