var _ = require('lodash');
var Promise = require('bluebird');
var Service = require('../models/primaryServiceDescriptor.js');
var contextManager = require('./contextManager.js');

Promise.promisifyAll(Service);
Promise.promisifyAll(Service.prototype);

var primaryServiceSelection = function () { };

/**
 * Search the services that best fit the current context
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The ordered operations id
 */
primaryServiceSelection.prototype.selectServices = function selectServices (context) {
    return new Promise(function (resolve, reject) {
        contextManager
            .getFilterNodes(context.context)
            .then(function (filterNodes) {
                return searchServices(filterNodes, context._id);
            })
            .then(function(services) {
                resolve(services);
            })
            .catch(function (e) {
                reject(e);
            });
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
        return new Error('No filter nodes selected!');
    }
}

module.exports = new primaryServiceSelection();