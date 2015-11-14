var _ = require('lodash');
var Promise = require('bluebird');
var Service = require('../models/primaryServiceAssociation.js');
var contextManager = require('./contextManager.js');

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
            .findAsync(whereClause, '_idOperation ranking weight');
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

module.exports = new primaryServiceSelection();