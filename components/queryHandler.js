var _ = require('lodash');
var Promise = require('bluebird');
var ServiceModel = require('../models/serviceDescription.js');
var ContextManager = require('./contextManager.js');
var translator = require('./translationManager.js');
var Interface = require('./interfaceChecker.js');
var restBridge = require('../bridges/restBridge.js');

Promise.promisifyAll(ServiceModel);

var bridgeFolder = '../bridges/';
var bridgeInterface = new Interface('bridgeInterface', ['executeQuery']);

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
            .then(function (responses) {
                resolve(responses);
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

/**
 * Translate some parameters to a value useful for the service invocation
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
                    console.log('ERROR: translation function \'' + p.transformFunction + '\' not exists');
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
        _.forEach(services, function (s, index) {
            if (s.protocol === 'rest' || s.protocol === 'query') {
                //use the rest bridge
                servicesPromises.push(
                    restBridge
                        .executeQuery(s, params)
                        .then(function (response) {
                            return transformResponse(s.operations[0].responseMapping, response)
                        })
                        .then(function (response) {
                            responses.splice(index, 0, response);
                        })
                        .catch(function (e) {
                            console.log('ERROR: Error during service \'' + s.name + '\' invocation');
                        })
                );
            } else if (s.protocol === 'custom') {
                //call the custom bridge
                var bridgeName = s.operations[0].bridgeName;
                if (!_.isEmpty(bridgeName) && !_.isUndefined(bridgeName)) {
                    try {
                        var module = require(bridgeFolder + bridgeName + '.js');
                        Interface.ensureImplements(module, bridgeInterface);
                        servicesPromises.push(
                            new module()
                                .executeQuery(params)
                                .then(function (response) {
                                    return transformResponse(s.operations[0].responseMapping, response)
                                })
                                .then(function (response) {
                                    responses.splice(index, 0, response);
                                })
                                .catch(function (e) {
                                    console.log('ERROR: Error during service \'' + s.name + '\' invocation');
                                })
                        );
                    } catch (e) {
                        console.log(e.message);
                    }
                } else {
                    console.log('ERROR: The service \'' + s.name + '\' must define a custom bridge');
                }
            }
        });
        Promise
            .all(servicesPromises)
            .then(function () {
                resolve(_.compact(responses));
            });
    });
}

/**
 * It transforms the response of the service to make it in internal representation
 * @param mapping The mapping rules for the specific service
 * @param response The response from the service
 * @returns {bluebird|exports|module.exports}
 */
function transformResponse (mapping, response) {
    return new Promise (function (resolve, reject) {
        if (response !== null && response !== 'undefined' && _.isObject(response)) {
            var transformedResponse = _.map(getItemValue(response, mapping.list), function (i) {
                return transformItem(i, mapping);
            });
            transformedResponse = executeFunctions(transformedResponse, mapping);
            resolve(transformedResponse);
        } else {
            reject('ERROR: wrong response type or empty response');
        }
    })
}

/**
 * Retrieve the value associated to a key
 * The key must be written in dot notation
 * Es.:
 * {
 *   'a': {
 *     'b': 'test'
 *   }
 * }
 * key = a.b --> test
 * @param item The item where to search the key
 * @param key The key to be searched. Write it in dot notation
 * @returns {*} The value found or null
 */
function getItemValue (item, key) {
    if (_.isUndefined(item)) {
        return null;
    }
    if (_.isEmpty(key) || _.isUndefined(key)) {
        return null;
    }
    var keys = key.split('.');
    var value = item;
    _.forEach(keys, function (k) {
        if (!_.isUndefined(value)) {
            value = value[k];
        } else {
            return null;
        }
    });
    return value;
}

/**
 * Tranform a single item in the new representation
 * @param item The original item
 * @param mapping The mapping rules
 * @returns {{}} The transformed object
 */
function transformItem (item, mapping) {
    var obj = {};
    _.forEach(mapping.items, function (m) {
        if (typeof m.path === 'string' && !_.isEmpty(m.path)) {
            var v = getItemValue(item, m.path);
            if (!_.isUndefined(v)) {
                obj[m.termName] = v;
            }
        }
    });
    return obj;
}

/**
 * Execute custom function on attributes
 * @param items The list of transformed items
 * @param mapping The mapping rules
 * @returns {*} The modified list of items
 */
function executeFunctions (items, mapping) {
    _.forEach(mapping.functions, function (f) {
        _.forEach(items, function (i) {
            if (_.has(i, f.onAttribute)) {
                try {
                    var fn = new Function('value', f.run);
                    var value = fn(i[f.onAttribute]);
                    if (!_.isEmpty(value) && !_.isUndefined(value)) {
                        i[f.onAttribute] = fn(i[f.onAttribute]);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    });
    return items;
}

module.exports = new queryHandler();