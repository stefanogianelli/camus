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
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The ordered operations id
 */
primaryServiceSelection.prototype.selectServices = function selectServices (context) {
    return new Promise(function (resolve, reject) {
        contextManager
            .getFilterNodes(context)
            .then(function (nodes) {
                //get the son node
                return [nodes, contextManager.getDescendants(context._id, nodes)];
            })
            .spread(function (baseNodes, sonNodes) {
                if (!_.isUndefined(sonNodes) && !_.isEmpty(sonNodes)) {
                    return provider.filterPrimaryServices(_.union(baseNodes, sonNodes), context._id);
                } else {
                    return provider.filterPrimaryServices(baseNodes, context._id);
                }
            })
            .then(function (services) {
                return loadSearchPlugins(context._id, services, context);
            })
            .then(function (services) {
                resolve(calculateRanking(services));
            })
            .catch(function (e) {
                reject(e.message);
            });
    })
};

/**
 * Search for the CDT nodes that need a specific search function and execute it
 * @param idCDT The id of the CDT
 * @param services The list of services retrieved by the standard search function
 * @param context The current context item
 * @returns {bluebird|exports|module.exports} The promise with the updated list of services
 */
function loadSearchPlugins (idCDT, services, context) {
    return new Promise(function (resolve, reject) {
        contextManager
            .getSpecificNodes(context)
            .then(function (nodes) {
                if (!_.isEmpty(nodes)) {
                    provider
                        .filterPrimaryServices(nodes, idCDT, true)
                        .then(function (data) {
                            executeModules(nodes, data, function (results) {
                                if (results !== null && results !== 'undefined') {
                                    services = services.concat(results);
                                    resolve(services);
                                }
                            });
                        });
                } else {
                    resolve(services);
                }
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
            var filter = _.filter(data, {dimension: n.dimension});
            if (!_.isEmpty(filter)) {
                var module = require('../searchPlugins/' + n.search + ".js");
                Interface.ensureImplements(module, searchPluginInterface);
                var Module = new module(filter);
                Module.search(n.value, function (results) {
                    if (!_.isUndefined(results) && !_.isNull(results)) {
                        if (_.isArray(results) && !_.isEmpty(results)) {
                            services = services.concat(results);
                        }
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
        if ('weight' in s && 'ranking' in s && '_idOperation' in s) {
            var rank = s.weight * (1 / s.ranking);
            var index = _.findIndex(rankedList, function (i) {
                return i._idOperation.equals(s._idOperation);
            });
            if (index === -1) {
                rankedList.push({
                    _idOperation: s._idOperation,
                    rank: rank
                });
            } else {
                rankedList[index].rank += rank;
            }
        }
    });
    rankedList = _.sortByOrder(rankedList, 'rank', 'desc');
    _.take(rankedList, N);
    return rankedList;
}

module.exports = new primaryServiceSelection();