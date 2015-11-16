var _ = require('lodash');
var Promise = require('bluebird');
var ServiceModel = require('../models/serviceDescription.js');
var ContextManager = require('./contextManager.js');
var translator = require('./translationManager.js');
var Interface = require('./interfaceChecker.js');

Promise.promisifyAll(ServiceModel);
Promise.promisifyAll(ServiceModel.prototype);

var bridgeFolder = '../bridges/';
var bridgeInterface = new Interface('bridgeInterface', ['executeQuery', 'convertResponse']);

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
                return translateParameters(params, context);
            })
            .then(function (params) {
                return callServices(serviceDescriptions, params);
            })
            .then(function (data) {
                console.log(data);
                resolve(serviceDescriptions);
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

/**
 * Translate some parameters to a value usefull for the service invocation
 * @param params The selected parameters
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of parameters with the translated values
 */
function translateParameters (params, context) {
    return new Promise (function (resolve, reject) {
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
                resolve(params);
            });
    });
}

/**
 * Call the service bridges and collect the responses
 * @param services The list of services to be queried
 * @param params The list of paramaters from the CDT
 * @returns {bluebird|exports|module.exports} The list of the responses, in order of service ranking
 */
function callServices (services, params) {
    return new Promise(function (resolve, reject) {
        var responses = [];
        var servicesPromises = [];
        _.forEach(services, function (s) {
            if (s.protocol === 'rest' || s.protocol === 'query') {
                //use the rest bridge
            } else {
                //call the custom bridge
            }
        });
        Promise
            .all(servicesPromises)
            .then(function () {
                resolve(_.compact(responses));
            });
    });
}

module.exports = new queryHandler();