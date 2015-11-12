var _ = require('lodash');
var Promise = require('bluebird');
var Service = require('../models/primaryServiceDescriptor.js');
var contextManager = require('./contextManager.js');

Promise.promisifyAll(Service);
Promise.promisifyAll(Service.prototype);

var primaryServiceSelection = function () { };

primaryServiceSelection.prototype.selectServices = function selectServices (context) {
    return new Promise(function (resolve, reject) {
        contextManager
            .getFilterNodes(context.context)
            .then(serchServices)
            .then(function(services) {
                resolve(services);
            })
            .catch(function (e) {
                console.log(e);
            });
    })
};

function serchServices (filterNodes) {
    if (filterNodes.length > 0) {
        return Service
            .findAsync(filterNodes, 'idOperation ranking weight');
    } else {
        return new Error('No filter nodes selected!');
    }
}

module.exports = new primaryServiceSelection();