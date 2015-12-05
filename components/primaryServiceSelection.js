var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');
var pluginManager = require('./pluginManager.js');

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
                filterServices: provider.filterPrimaryServices(decoratedCdt.filterNodes, decoratedCdt._id),
                //search for services associated to the ranking nodes
                rankingServices: provider.filterPrimaryServices(decoratedCdt.rankingNodes, decoratedCdt._id),
                //load specific module for search other filter services
                filterSpecific: loadSearchPlugins(decoratedCdt._id, decoratedCdt.specificFilterNodes),
                //load specific module for search other ranking services
                rankingSpecific: loadSearchPlugins(decoratedCdt._id, decoratedCdt.specificRankingNodes)
            })
            .then(function (results) {
                //merge filter nodes results
                var filter = _.union(results.filterServices, results.filterSpecific);
                //merge ranking nodes results
                var ranking = _.union(results.rankingServices, results.rankingSpecific);
                //discard the ranking nodes that haven't a correspondence in the filter nodes list
                ranking = intersect(filter, ranking);
                //add the weight values for each item
                _.forEach(filter, function (i) {
                    i['weight'] = filterWeight;
                });
                _.forEach(ranking, function (i) {
                    i['weight'] = rankingWeight;
                });
                //calculate the ranking of the merged list
                resolve(calculateRanking(_.union(filter, ranking)));
            })
            .catch(function (e) {
                console.log(e);
                resolve();
            });
    })
};

/**
 * Search for the CDT nodes that need a specific search function and execute it
 * @param idCDT The CDT identifier
 * @param specificNodes The list of specific nodes
 * @returns {bluebird|exports|module.exports} The promise with the services found
 */
function loadSearchPlugins (idCDT, specificNodes) {
    return new Promise(function (resolve, reject) {
        if (!_.isUndefined(specificNodes) && !_.isEmpty(specificNodes)) {
            provider
                .filterPrimaryServices(specificNodes, idCDT, true)
                .then(function (data) {
                    //call the function that takes care to execute the search functions
                    return pluginManager.executeModules(specificNodes, data);
                })
                .then(function (results) {
                    //clean the results
                    results = _.map(results, function (r) {
                        return {
                            ranking: r.ranking,
                            _idOperation: r._idOperation
                        };
                    });
                    resolve(results);
                })
                .catch(function (e) {
                    reject(e);
                });
        } else {
            //no specific search needed
            resolve();
        }
    });
}

/**
 * Compute the ranking of each operation found by the previous steps
 * @param services The list of services, with own rank and weight
 * @returns {Array} The ranked list of Top-N services
 */
function calculateRanking (services) {
    var rankedList = [];
    _.forEach(services, function (s) {
        //calculate the ranking of the current service
        var rank = s.weight * (1 / s.ranking);
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
}

/**
 * Return the intersection of two arrays.
 * The base item for comparison is the Operation Identifier
 * @param array1 The first array
 * @param array2 The second array
 * @returns {Array} The array intersection of the input ones
 */
function intersect (array1, array2) {
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

module.exports = new primaryServiceSelection();