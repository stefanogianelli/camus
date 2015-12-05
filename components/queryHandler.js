var _ = require('lodash');
var Promise = require('bluebird');
var translator = require('./translationManager.js');
var Interface = require('./interfaceChecker.js');
var restBridge = require('../bridges/restBridge.js');
var provider = require('../provider/provider.js');

var bridgeFolder = '../bridges/';
//every bridge must implement the 'executeQuery' method
var bridgeInterface = new Interface('bridgeInterface', ['executeQuery']);

var queryHandler = function () { };

/**
 * It receives a list of services, then translate the parameters (if needed) and prepare the bridges for service calls.
 * When all responses are returned there are translated in the internal format based on response mapping in the service description.
 * @param services The list of operation identifiers in ascending order of priority
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of responses received by the services, already transformed in internal representation
 */
queryHandler.prototype.executeQueries = function executeQueries (services, decoratedCdt) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(services)) {
            Promise
                .map(services, function (s) {
                    //for each operation identifier retrieve the respective service description
                    return provider.getServiceByOperationId(s._idOperation);
                })
                .then(function (serviceDescriptions) {
                    //check if some parameters need translation
                    return [serviceDescriptions, translateParameters(decoratedCdt.parameterNodes, decoratedCdt)];
                })
                .spread(function (serviceDescriptions, params) {
                    //execute the queries toward web services
                    return callServices(serviceDescriptions, params);
                })
                .then(function (responses) {
                    resolve(responses);
                })
                .catch(function (e) {
                    reject(e);
                });
        } else {
            resolve();
        }
    });
};

/**
 * Translate the parameters to a value useful for the service invocation
 * @param params The selected parameters
 * @param decoratedCdt The current context
 * @returns {bluebird|exports|module.exports} The list of parameters with the translated values
 */
function translateParameters (params, decoratedCdt) {
    return new Promise (function (resolve, reject) {
        Promise
            //take only the parameters that have specified a translation function
            .map(_.filter(params, 'transformFunction'), function (p) {
                //check if the translation function is defined
                if (typeof translator[p.transformFunction] == 'function') {
                    //call the function to retrieve the translated value
                    return translator[p.transformFunction](decoratedCdt.interestTopic, p.value)
                        .then(function (value) {
                            //modify the value with the translated one
                            p.value = value;
                        })
                        .catch(function (e) {
                            console.log(e);
                        })
                } else {
                    console.log('ERROR: translation function \'' + p.transformFunction + '\' not exists');
                }
            })
            .then(function () {
                resolve(params);
            });
    });
}

/**
 * Call the service bridges and collect the responses
 * @param services The list of services to be queried
 * @param params The list of parameters from the CDT
 * @returns {bluebird|exports|module.exports} The list of the responses, in order of service ranking
 */
function callServices (services, params) {
    return new Promise(function (resolve, reject) {
        Promise
            .mapSeries(services, function (s) {
                console.log('Make call to \'' + s.name + '\' service');
                var promise;
                //check if the protocol of the current service is 'rest' o 'query'
                if (s.protocol === 'rest' || s.protocol === 'query') {
                    //use the rest bridge
                    promise = restBridge.executeQuery(s, params);
                } else if (s.protocol === 'custom') {
                    //call the custom bridge
                    var bridgeName = s.operations[0].bridgeName;
                    //check if a bridge name is defined
                    if (!_.isEmpty(bridgeName) && !_.isUndefined(bridgeName)) {
                        //load the module
                        var module = require(bridgeFolder + bridgeName + '.js');
                        //check if the module implements the bridge interface
                        Interface.ensureImplements(module, bridgeInterface);
                        promise = new module().executeQuery(params);
                    } else {
                        console.log('ERROR: The service \'' + s.name + '\' must define a custom bridge');
                    }
                }
                return promise
                    .then(function (response) {
                        //transform the response
                        return transformResponse(s.operations[0].responseMapping, response)
                    })
                    .catch(function (e) {
                        console.log('[' + s.name + '] ERROR: ' + e);
                    });
            })
            .then(function (responses) {
                //leave the undefined responses
                responses = _(responses)
                    .filter(function (item) {
                        return !_.isUndefined(item) && !_.isEmpty(item);
                    })
                    .value();
                resolve(responses);
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
        if (!_.isUndefined(response) && _.isObject(response)) {
            if (!_.isUndefined(mapping)) {
                var transformedResponse = _.map(retrieveListOfResults(response, mapping.list), function (i) {
                    return transformItem(i, mapping);
                });
                transformedResponse = executeFunctions(transformedResponse, mapping);
                //clean the response from empty objects
                transformedResponse = _(transformedResponse)
                    .filter(function (item) {
                        return !_.isUndefined(item) && !_.isEmpty(item);
                    })
                    .value();
                resolve(transformedResponse);
            } else {
                reject('no mapping associated to the service');
            }
        } else {
            reject('wrong response type or empty response');
        }
    })
}

/**
 * It retrieve the base path where find the list of result items.
 * If the specified path is not an array it converts it to an array.
 * @param response The response received from the web service
 * @param listItem The base path where find the items. If the root of the document if the base path leave this field empty
 * @returns {Array} The array of items
 */
function retrieveListOfResults (response, listItem) {
    var list = [];
    if (!_.isUndefined(listItem) && !_.isEmpty(listItem)) {
        //it was defined a base list item so consider it as root for the transformation
        list = getItemValue(response, listItem);
    } else {
        //start at the root element
        list = response;
    }
    //check if the current list is an array, otherwise I transform it in a list from the current set of objects
    if (!_.isArray(list)) {
        list = _.map(list, function(item) {
            return item;
        });
    }
    return list;
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
            if (!_.isUndefined(v) && !_.isEmpty(v)) {
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