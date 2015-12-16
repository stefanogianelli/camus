'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

import Interface from './interfaceChecker.js';
import RestBridge from '../bridges/restBridge.js';
import Provider from '../provider/provider.js';
import TransformResponse from './transformResponse.js';

const restBridge = new RestBridge();
const provider = new Provider();
const transformResponse = new TransformResponse();

export default  class QueryHandler {

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
                        return provider.getServiceByOperationId(s._idOperation);
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
                    const operation = s.operations[0];
                    let promise;
                    //check if the protocol of the current service is 'rest' o 'query'
                    if (s.protocol === 'rest' || s.protocol === 'query') {
                        //use the rest bridge
                        promise = restBridge.executeQuery(s, params);
                    } else if (s.protocol === 'custom') {
                        //call the custom bridge
                        let bridgeName = operation.bridgeName;
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
                            return transformResponse.mappingResponse(operation.responseMapping, response)
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