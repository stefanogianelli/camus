'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import System from 'systemjs';
import config from 'config';

import RestBridge from '../bridges/restBridge';
import Provider from '../provider/provider';
import TransformResponse from './transformResponse';
import Metrics from '../utils/MetricsUtils';

const restBridge = new RestBridge();
const provider = new Provider();
const transformResponse = new TransformResponse();

let debug = false;
if (config.has('debug')) {
    debug = config.get('debug');
}

let metrics = null;
if (debug) {
    const filePath = __dirname.replace('components', '') + '/metrics/QueryHandler.txt';
    metrics = new Metrics(filePath);
}

System.config({
    baseURL: '../',
    transpiler: 'traceur',
    defaultJSExtensions: true,
    map: {
        bluebird: '../node_modules/bluebird/js/release/bluebird.js',
        lodash: '../node_modules/lodash/index.js'
    }
});

/**
 * QueryHandler
 */
export default class {

    constructor () {
        //shortcut to the bridges folder
        this._bridgeFolder = '../server/bridges/';
    }

    /**
     * It receives a list of services, then translate the parameters (if needed) and prepare the bridges for service calls.
     * When all responses are returned there are translated in the internal format based on response mapping in the service description.
     * @param services The list of operation identifiers in ascending order of priority
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of responses received by the services, already transformed in internal representation
     */
    executeQueries (services, decoratedCdt) {
        //if no service was selected, return an empty object
        if (_.isEmpty(services)) {
            return Promise.resolve();
        }
        const startTime = process.hrtime();
        return Promise
            .map(services, service => {
                const startService = process.hrtime();
                //acquire the service descriptions from the DB
                return provider
                    .getServiceByOperationId(service._idOperation)
                    .then(serviceDescriptor => {
                        if (_.isUndefined(serviceDescriptor)) {
                            return [];
                        }
                        if (debug) {
                            metrics.record('getDescription/' + serviceDescriptor.name, startService);
                        }
                        //add the ranking value
                        serviceDescriptor.rank = service.rank;
                        //make call to the current service
                        return this._callService(serviceDescriptor, decoratedCdt.parameterNodes);
                    });
            })
            //merge the results
            .reduce((a, b) => {
                return _.concat(a,b);
            })
            .finally(() => {
                if (debug) {
                    metrics.record('executeQueries', startTime);
                    metrics.saveResults();
                }
            });
    }

    /**
     * Call the correct service's bridge and transform the response to make an array of items
     * @param descriptor The service description
     * @param params The list of parameters from the CDT
     * @returns {Promise.<T>} The list of the responses, in order of service ranking
     * @private
     */
    _callService (descriptor, params) {
        let promise;
        //check if the protocol of the current service is 'rest' o 'query'
        if (descriptor.service.protocol === 'rest' || descriptor.service.protocol === 'query') {
            //use the rest bridge
            const paginationArgs = {
                numOfPages: 1
            };
            promise = restBridge.executeQuery(descriptor, params, paginationArgs);
        } else if (descriptor.service.protocol === 'custom') {
            //call the custom bridge
            //check if a bridge name is defined
            if (!_.isUndefined(descriptor.bridgeName) && !_.isEmpty(descriptor.bridgeName)) {
                //load the module
                promise = System
                    .import(this._bridgeFolder + descriptor.bridgeName)
                    .then(Module => {
                        const module = new Module.default();
                        return module.executeQuery(params);
                    });
            } else {
                console.log('ERROR: The service \'' + descriptor.service.name + '\' must define a custom bridge');
                return Promise.resolve([]);
            }
        }
        const start = process.hrtime();
        return promise
            .then(responses => {
                if (debug) {
                    metrics.record('bridgeExecution', start);
                }
                const startAggr = process.hrtime();
                //create the list of items
                return Promise
                    .reduce(responses, (output, response) => {
                        return transformResponse
                            .retrieveListOfResults(response, descriptor.responseMapping.list)
                            .then(itemList => {
                                if (!_.isUndefined(itemList) && !_.isEmpty(itemList)) {
                                    return _.concat(output, itemList);
                                } else {
                                    return output;
                                }
                            })
                            .catch(e => {
                                console.log('[' + descriptor.service.name + '] ERROR: ' + e);
                                return output;
                            });
                    }, [])
                    .finally(() => {
                        if (debug) {
                            metrics.record('transformResponse', startAggr);
                        }
                    });
            })
            .then(itemArray => {
                //transform the response
                return transformResponse
                    .mappingResponse(descriptor.responseMapping, itemArray)
            })
            .catch(e => {
                console.log('[' + descriptor.service.name + '] ERROR: ' + e);
                return Promise.resolve([]);
            });
    }

}