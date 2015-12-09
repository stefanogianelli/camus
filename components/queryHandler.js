var _ = require('lodash');
var Promise = require('bluebird');
var Interface = require('./interfaceChecker.js');
var restBridge = require('../bridges/restBridge.js');
var provider = require('../provider/provider.js');
var transformResponse = require('./transformResponse.js');

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
                    //execute the queries toward web services
                    return queryHandler.prototype._callServices(serviceDescriptions, decoratedCdt.parameterNodes);
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
 * Call the service bridges and collect the responses
 * @param services The list of services to be queried
 * @param params The list of parameters from the CDT
 * @returns {bluebird|exports|module.exports} The list of the responses, in order of service ranking
 */
queryHandler.prototype._callServices = function _callServices (services, params) {
    return new Promise(function (resolve, reject) {
        Promise
            .mapSeries(services, function (s) {
                var promise;
                //check if the protocol of the current service is 'rest' o 'query'
                if (s.protocol === 'rest' || s.protocol === 'query') {
                    //use the rest bridge
                    promise = restBridge.executeQuery(s, params);
                } else if (s.protocol === 'custom') {
                    //call the custom bridge
                    var bridgeName = s.operations[0].bridgeName;
                    //check if a bridge name is defined
                    if (!_.isUndefined(bridgeName) && !_.isEmpty(bridgeName)) {
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
                        return transformResponse.mappingResponse(s.operations[0].responseMapping, response)
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
};

module.exports = new queryHandler();