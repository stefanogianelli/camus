var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');
var pluginManager = require('./pluginManager.js');

//number of services to keep
var N = 3;

var primaryServiceSelection = function () { };

/**
 * Search the services that best fit the current context
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The ordered operations id
 */
primaryServiceSelection.prototype.selectServices = function selectServices (decoratedCdt) {
    return new Promise(function (resolve, reject) {
        provider
            .filterPrimaryServices(decoratedCdt.filterNodes, decoratedCdt._id)
            .then(function (services) {
                //check if some services need a custom search function and execute it
                return [services, loadSearchPlugins(decoratedCdt._id, decoratedCdt.specificNodes)];
            })
            .spread(function (filterServices, customSearchServices) {
                //calculate the ranking and returns the list
                resolve(calculateRanking(_.union(filterServices, customSearchServices)));
            })
            .catch(function (e) {
                reject(e);
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
                    //return the services found
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

module.exports = new primaryServiceSelection();