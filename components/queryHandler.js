var _ = require('lodash');
var Promise = require('bluebird');
var ServiceModel = require('../models/serviceDescription.js');
var ContextManager = require('./contextManager.js');
var translator = require('./translationManager.js');

Promise.promisifyAll(ServiceModel);
Promise.promisifyAll(ServiceModel.prototype);

var queryHandler = function () { };

queryHandler.prototype.executeQueries = function executeQueries (services, context) {
    return new Promise(function (resolve, reject) {
        var serviceDescriptions = [];
        var servicePromises = [];
        _.forEach(services, function (s, index) {
            servicePromises.push(
                ServiceModel
                    .findByOperationIdAsync(s._idOperation)
                    .then(function (serviceData) {
                        serviceDescriptions.splice(index, 0, serviceData);
                    })
            );
        });
        Promise
            .all(servicePromises)
            .then(function () {
                return ContextManager.getParameterNodes(context);
            })
            .then(function (params) {
                //check if some parameters need translation
                var interestTopic = ContextManager.getInterestTopic(context);
                var translationPromises = [];
                _.forEach(params, function (p) {
                    if (_.has(p, 'transformFunction')) {
                        //check if the translation function is defined
                        if (typeof translator[p.transformFunction] == 'function') {
                            translationPromises.push(
                                translator[p.transformFunction](interestTopic, p.value)
                                    .then(function (value) {
                                        p.value = value;
                                    })
                                    .catch(function (e) {
                                        console.log(e);
                                    })
                            );
                        } else {
                            console.log('function not exists');
                        }
                    }
                });
                Promise
                    .all(translationPromises)
                    .then(function () {
                        console.log(params);
                        resolve(serviceDescriptions);
                    });
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

module.exports = new queryHandler();