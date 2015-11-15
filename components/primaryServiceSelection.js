var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var Service = require('../models/primaryServiceAssociation.js');
var contextManager = require('./contextManager.js');
var Interface = require('./interfaceChecker.js');

var searchPluginInterface = new Interface('searchPluginInterface', ['search']);

Promise.promisifyAll(Service);
Promise.promisifyAll(Service.prototype);

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
        if (context !== null && _.has(context, 'context')) {
            contextManager
                .getFilterNodes(context.context)
                .then(function (filterNodes) {
                    return searchServices(filterNodes, context._id);
                })
                .then(function (services) {
                    return loadSearchPlugins(context._id, services, context.context);
                })
                .then(function (services) {
                    resolve(calculateRanking(services));
                })
                .catch(function (e) {
                    reject(e.message);
                });
        } else {
            reject('No context selected');
        }
    })
};

/**
 * Search the services associated with the filter nodes of the current context
 * @param filterNodes The list of filter nodes selected
 * @param idCDT The id of the CDT
 * @returns {*} The list of operation id, with ranking and weight, of the found services
 */
function searchServices (filterNodes, idCDT) {
    if (filterNodes.length > 0) {
        var whereClause = {
            _idCDT: idCDT,
            $or: []
        };
        _.forEach(filterNodes, function (n) {
            var obj = {
                $and: [n]
            };
            whereClause.$or.push(obj);
        });
        return Service
            .findAsync(whereClause, {_idOperation:1, ranking:1, weight: 1, _id: 0});
    } else {
        throw new Error('No filter nodes selected!');
    }
}

/**
 * Compute the ranking of each operation found by the previous steps
 * @param services The list of services, with own rank and weight
 * @returns {Array} The ranked list of Top-N services
 */
function calculateRanking (services) {
    var rankedList = [];
    _.forEach(services, function (s) {
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
    });
    rankedList = _.sortByOrder(rankedList, 'rank', 'desc');
    _.take(rankedList, N);
    return rankedList;
}

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
                if (nodes.length > 0) {
                    Service
                        .findAsync({_idCDT: idCDT}, {_idCDT: 0, _id: 0, __v: 0})
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
                var module = require('../searchPlugins/' + n.search + ".js");
                Interface.ensureImplements(module, searchPluginInterface);
                var Module = new module(data);
                Module.search(function (results) {
                    if (results !== null && results !== 'undefined') {
                        if (_.isArray(results) && results.length > 0) {
                            services = services.concat(results);
                        }
                    }
                });
            } catch (e) {
                console.log(e);
            } finally {
                callback();
            }
        },
        function () {
            callback(services);
        });
}

module.exports = new primaryServiceSelection();