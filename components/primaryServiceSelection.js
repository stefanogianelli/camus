var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var contextManager = require('./contextManager.js');
var Interface = require('./interfaceChecker.js');
var provider = require('../provider/provider.js');

var searchPluginInterface = new Interface('searchPluginInterface', ['search']);

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
        contextManager
            //acquire the filter nodes associated to the decorated CDT
            .getFilterNodes(decoratedCdt)
            .then(function (nodes) {
                //check if the retrieved nodes have descendants
                return [nodes, contextManager.getDescendants(decoratedCdt._id, nodes)];
            })
            .spread(function (baseNodes, sonNodes) {
                //obtain the list of services associated to the nodes selected
                if (!_.isUndefined(sonNodes) && !_.isEmpty(sonNodes)) {
                    return provider.filterPrimaryServices(_.union(baseNodes, sonNodes), decoratedCdt._id);
                } else {
                    return provider.filterPrimaryServices(baseNodes, decoratedCdt._id);
                }
            })
            .then(function (services) {
                //check if some services need a custom search function and execute it
                return [services, loadSearchPlugins(decoratedCdt)];
            })
            .spread(function (filterServices, customSearchServices) {
                //calculate the ranking and returns the list
                if (!_.isUndefined(customSearchServices) && !_.isEmpty(customSearchServices)) {
                    resolve(calculateRanking(_.union(filterServices, customSearchServices)));
                } else {
                    resolve(calculateRanking(filterServices));
                }
            })
            .catch(function (e) {
                reject(e.message);
            });
    })
};

/**
 * Search for the CDT nodes that need a specific search function and execute it
 * @param decoratedCdt The current decorated CDT
 * @returns {bluebird|exports|module.exports} The promise with the services found
 */
function loadSearchPlugins (decoratedCdt) {
    return new Promise(function (resolve, reject) {
        contextManager
            //acquire the nodes that need a custom search function
            .getSpecificNodes(decoratedCdt)
            .then(function (nodes) {
                if (!_.isEmpty(nodes)) {
                    //retrieve the association data for the dimensions
                    return [nodes, provider.filterPrimaryServices(nodes, decoratedCdt._id, true)];
                } else {
                    resolve();
                }
            })
            .spread(function (nodes, data) {
                //call the function that takes care to execute the search functions
                executeModules(nodes, data, function (results) {
                    //return the services found
                    resolve(results);
                });
            })
            .catch(function (e) {
                reject(e);
            });
    });
}

/**
 * Executes all the specific search modules
 * @param nodes The list of nodes that need a specific search function
 * @param data The service association list for the current CDT
 * @param callback The callback function
 */
function executeModules (nodes, data, callback) {
    var services = [];
    async.each(nodes, function (n, callback) {
        try {
            //select the association data associated to the currently analyzed dimension
            var filter = _.filter(data, {dimension: n.dimension});
            if (!_.isEmpty(filter)) {
                //load the module
                var module = require('../searchPlugins/' + n.searchFunction + ".js");
                //check that the module implements the search plugin interface
                Interface.ensureImplements(module, searchPluginInterface);
                //initialize the module with the correct data
                var Module = new module(filter);
                //launch the search function with the value obtained by the decorated CDT
                Module.search(n.value, function (results) {
                    if (!_.isUndefined(results) && _.isArray(results) && !_.isEmpty(results)) {
                        services = _.union(services, results);
                    }
                });
            }
        } catch (e) {
            console.log(e.message);
        } finally {
            callback();
        }
    },
    function () {
        callback(services);
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