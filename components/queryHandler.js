'use strict';

let _ = require('lodash');
let Promise = require('bluebird');
let Interface = require('./interfaceChecker.js');
let restBridge = require('../bridges/restBridge.js');
let RestBridge = new restBridge();
let provider = require('../provider/provider.js');
let Provider = new provider();
let transformResponse = require('./transformResponse.js');
let TransformResponse = new transformResponse();

class QueryHandler {

    constructor () {
        //shortcut to the bridges folder
        this._bridgeFolder = '../bridges/';
        //every bridge must implement the 'executeQuery' method
        this._bridgeInterface = new Interface('bridgeInterface', ['executeQuery']);
    }

    /**
     * It receives a list of services, then translate the parameters (if needed) and prepare the bridges for service calls.
     * When all responses are returned there are translated in the internal format based on response mapping in the service description.
     * @param services The list of operation identifiers in ascending order of priority
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of responses received by the services, already transformed in internal representation
     */
    executeQueries (services, decoratedCdt) {
        return new Promise((resolve, reject) => {
            if (!_.isEmpty(services)) {
                Promise
                    .map(services, s => {
                        //for each operation identifier retrieve the respective service description
                        return Provider.getServiceByOperationId(s._idOperation);
                    })
                    .then(serviceDescriptions => {
                        //execute the queries toward web services
                        return this._callServices(serviceDescriptions, decoratedCdt.parameterNodes);
                    })
                    .then(responses => {
                        resolve(responses);
                    })
                    .catch(e => {
                        reject(e);
                    });
            } else {
                resolve();
            }
        });
    }

    /**
     * Call the service bridges and collect the responses
     * @param services The list of services to be queried
     * @param params The list of parameters from the CDT
     * @returns {bluebird|exports|module.exports} The list of the responses, in order of service ranking
     * @private
     */
    _callServices (services, params) {
        return new Promise(resolve => {
            Promise
                .mapSeries(services, s => {
                    let promise;
                    //check if the protocol of the current service is 'rest' o 'query'
                    if (s.protocol === 'rest' || s.protocol === 'query') {
                        //use the rest bridge
                        promise = RestBridge.executeQuery(s, params);
                    } else if (s.protocol === 'custom') {
                        //call the custom bridge
                        let bridgeName = s.operations[0].bridgeName;
                        //check if a bridge name is defined
                        if (!_.isUndefined(bridgeName) && !_.isEmpty(bridgeName)) {
                            //load the module
                            let module = require(this._bridgeFolder + bridgeName + '.js');
                            //check if the module implements the bridge interface
                            Interface.ensureImplements(module, this._bridgeInterface);
                            promise = new module().executeQuery(params);
                        } else {
                            console.log('ERROR: The service \'' + s.name + '\' must define a custom bridge');
                        }
                    }
                    return promise
                        .then(response => {
                            //transform the response
                            return TransformResponse.mappingResponse(s.operations[0].responseMapping, response)
                        })
                        .catch(e => {
                            console.log('[' + s.name + '] ERROR: ' + e);
                        });
                })
                .then(responses => {
                    //leave the undefined responses
                    responses = _(responses)
                        .filter(item => {
                            return !_.isUndefined(item) && !_.isEmpty(item);
                        })
                        .value();
                    resolve(responses);
                });
        });
    }

}

module.exports = QueryHandler;