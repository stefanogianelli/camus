'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import System from 'systemjs'
import config from 'config'

import RestBridge from '../bridges/restBridge'
import Provider from '../provider/provider'
import ResponseParser from './responseParser'
import Metrics from '../utils/MetricsUtils'

System.config({
    baseURL: '../',
    transpiler: 'traceur',
    defaultJSExtensions: true,
    map: {
        bluebird: './node_modules/bluebird/js/release/bluebird.js',
        lodash: './node_modules/lodash/index.js'
    }
})

/**
 * The Query Handler receives the list of services to be queried and call the most appropriate bridge to complete this task.
 * After a response is received, it handles the transformation in the 'semantic term' form.
 */
export default class {

    constructor () {
        //shortcut to the bridges folder
        this._bridgeFolder = './src/bridges/'
        //initialize components
        this._restBridge = new RestBridge()
        this._provider = Provider.getInstance()
        this._responseParser = new ResponseParser()
        //initialize metrics utility
        this._metricsFlag = false
        if (config.has('metrics')) {
            this._metricsFlag = config.get('metrics')
        }
        this._metrics = null
        if (this._metricsFlag) {
            this._metrics = Metrics.getInstance()
        }
    }

    /**
     * It receives a list of services, then translate the parameters (if needed) and prepare the bridges for service calls.
     * When all responses are returned they are translated in the internal format based on response mapping information in the service description.
     * @param {Array} services - The list of operation identifiers in ascending order of priority
     * @param {Object} decoratedCdt - The decorated CDT
     * @returns {Promise<Object>} It returns an object composed as follow:
     * {
     *  {Array} servicesStatus: the metadata about the service status (eg.: it provides information about pagination)
     *  {Array} results: the list of responses received by the services, already transformed in internal representation
     * }
     */
    executeQueries (services, decoratedCdt) {
        //if no service was selected, return an empty object
        if (_.isEmpty(services)) {
            return Promise.resolve()
        }
        const startTime = process.hrtime()
        return this._provider
            .getServicesByOperationIds(_.map(services, '_idOperation'))
            .map(service => {
                if (this._metricsFlag) {
                    this._metrics.record('QueryHandler', 'getDescriptions', 'MAINDB', startTime)
                }
                //add the ranking value
                service.service.rank = _(services).find(s => service._id.equals(s._idOperation)).rank
                //make call to the current service
                return this._callService(service, decoratedCdt, services)
            })
            .then(results => {
                //merge the results
                let output = {
                    servicesStatus: [],
                    results: []
                }
                _(results).forEach(item => {
                    if (!_.isUndefined(item.serviceStatus))
                        output.servicesStatus.push(item.serviceStatus)
                    if (!_.isUndefined(item.response) && !_.isEmpty(item.response))
                        output.results = _.concat(output.results, item.response)
                })
                return output
            })
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('QueryHandler', 'executeQueries', 'MAIN', startTime)
                }
            })
    }

    /**
     * Call the correct service's bridge and transform the response to make it an array of items
     * @param {Object} descriptor - The service description
     * @param {Object} decoratedCdt - The decorated CDT
     * @param {Object} paginationStatus - The pagination information about all the services
     * @returns {Promise<Object>} It returns an object composed as follow:
     * {
     *  serviceStatus: {
     *      {idOperation} idOperation: the operation's identifier
     *      {Boolean} hasNextPage: true if the service can give back another page with other results
     *      {String|Number} nextPage: the token or number to request the next page
     *  }
     *  {Array} response: the transformed list of items received from the service
     * }
     * @private
     */
    _callService (descriptor, decoratedCdt, paginationStatus) {
        const start = process.hrtime()
        let promise
        //check if the protocol of the current service is 'rest' o 'query'
        if (descriptor.service.protocol === 'rest' || descriptor.service.protocol === 'query') {
            //get the pagination configuration for the current service
            const servicePaginationConfig = _(paginationStatus).find(s => descriptor._id.equals(s._idOperation))
            let startPage = undefined
            if (!_.isUndefined(servicePaginationConfig)) {
                if (servicePaginationConfig.hasNextPage)
                    startPage = servicePaginationConfig.nextPage
            }
            //use the rest bridge
            promise = this._restBridge.executeQuery(descriptor, decoratedCdt, {startPage})
        } else if (descriptor.service.protocol === 'custom') {
            //call the custom bridge
            //check if a bridge name is defined
            if (!_.isUndefined(descriptor.bridgeName) && !_.isEmpty(descriptor.bridgeName)) {
                //load the module
                promise = Promise.all([System
                    .import(this._bridgeFolder + descriptor.bridgeName)
                    .then(Module => {
                        const module = new Module.default()
                        return module.executeQuery(decoratedCdt)
                    })]).then(results => {
                        return results[0]
                    })
            } else {
                console.log('ERROR: The service \'' + descriptor.service.name + '\' must define a custom bridge')
                return Promise.resolve([])
            }
        }
        return promise
            .then(response => {
                if (this._metricsFlag) {
                    this._metrics.record('QueryHandler', 'bridgeExecution', 'EXT', start)
                }
                //transform the response
                return [response, this._responseParser.mappingResponse(response.response, descriptor)]
            }).spread((response, mappedResponse) => {
                //packaging a response with information about pagination status of the service
                return {
                    serviceStatus: {
                        idOperation: descriptor._id,
                        hasNextPage: response.hasNextPage,
                        nextPage: response.nextPage
                    },
                    response: mappedResponse
                }
            })
            .catch(e => {
                console.log('[' + descriptor.service.name + '] ' + e)
                return Promise.resolve([])
            })
    }

}