'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import System from 'systemjs';

import RestBridge from '../bridges/restBridge';
import Provider from '../provider/provider';
import TransformResponse from './transformResponse';
import Metrics from '../utils/MetricsUtils';

const restBridge = new RestBridge();
const provider = new Provider();
const transformResponse = new TransformResponse();

const filePath = __dirname.replace('components', '') + '/metrics/QueryHandler.txt';
const metrics = new Metrics(filePath);

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
        const startTime = Date.now();
        return provider
            //acquire the service descriptions from the DB
            .getServicesByOperationIds(_.pluck(services, '_idOperation'))
            .map(service => {
                //make call to the current service
                return this._callService(service, decoratedCdt.parameterNodes);
            })
            .reduce((a, b) => {
                return _.union(a,b);
            })
            .finally(() => {
                metrics.record('executeQueries', startTime, Date.now());
                metrics.saveResults();
            });
    }

    /**
     * Call the correct service's bridge and transform the response to make an array of items
     * @param service The service description
     * @param params The list of parameters from the CDT
     * @returns {Promise.<T>} The list of the responses, in order of service ranking
     * @private
     */
    _callService (service, params) {
        const operation = service.operations;
        let promise;
        //check if the protocol of the current service is 'rest' o 'query'
        if (service.protocol === 'rest' || service.protocol === 'query') {
            //use the rest bridge
            const paginationArgs = {
                numOfPages: 3
            };
            promise = restBridge.executeQuery(service, params, paginationArgs);
        } else if (service.protocol === 'custom') {
            //call the custom bridge
            let bridgeName = operation.bridgeName;
            //check if a bridge name is defined
            if (!_.isUndefined(bridgeName) && !_.isEmpty(bridgeName)) {
                //load the module
                promise = System
                    .import(this._bridgeFolder + bridgeName)
                    .then(Module => {
                        const module = new Module.default();
                        return module.executeQuery(params);
                    });
            } else {
                console.log('ERROR: The service \'' + service.name + '\' must define a custom bridge');
                return Promise.resolve();
            }
        }
        return promise
            .then(responses => {
                //create the list of items
                return Promise
                    .reduce(responses, (output, response) => {
                        return transformResponse
                            .retrieveListOfResults(response, operation.responseMapping.list)
                            .then(itemList => {
                                if (!_.isUndefined(itemList) && !_.isEmpty(itemList)) {
                                    return _.union(output, itemList);
                                } else {
                                    return output;
                                }
                            })
                            .catch(e => {
                                console.log('[' + service.name + '] ERROR: ' + e);
                                return output;
                            });
                    }, []);
            })
            .then(itemArray => {
                //transform the response
                return transformResponse
                    .mappingResponse(operation.responseMapping, itemArray)
            })
            .catch(e => {
                console.log('[' + service.name + '] ERROR: ' + e);
                return Promise.resolve();
            });
    }

}