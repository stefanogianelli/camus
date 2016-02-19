'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import System from 'systemjs'
import config from 'config'

import RestBridge from '../bridges/restBridge'
import Provider from '../provider/provider'
import TransformResponse from './transformResponse'
import Metrics from '../utils/MetricsUtils'

System.config({
    baseURL: '../',
    transpiler: 'traceur',
    defaultJSExtensions: true,
    map: {
        bluebird: '../node_modules/bluebird/js/release/bluebird.js',
        lodash: '../node_modules/lodash/index.js'
    }
})

/**
 * QueryHandler
 */
export default class {

    constructor () {
        //shortcut to the bridges folder
        this._bridgeFolder = '../server/bridges/'
        //initialize components
        this._restBridge = new RestBridge()
        this._provider = Provider.getInstance()
        this._transformResponse = new TransformResponse()
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
     * When all responses are returned there are translated in the internal format based on response mapping in the service description.
     * @param services The list of operation identifiers in ascending order of priority
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of responses received by the services, already transformed in internal representation
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
                service.service.rank = _(services).find(s => s._idOperation.equals(service._id)).rank
                //make call to the current service
                return this._callService(service, decoratedCdt)
            })
            //merge the results
            .reduce((a, b) => {
                return _.concat(a,b)
            })
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('QueryHandler', 'executeQueries', 'MAIN', startTime)
                }
            })
    }

    /**
     * Call the correct service's bridge and transform the response to make an array of items
     * @param descriptor The service description
     * @param decoratedCdt The decorated CDT
     * @returns {Promise.<T>} The list of the responses, in order of service ranking
     * @private
     */
    _callService (descriptor, decoratedCdt) {
        const start = process.hrtime()
        let promise
        //check if the protocol of the current service is 'rest' o 'query'
        if (descriptor.service.protocol === 'rest' || descriptor.service.protocol === 'query') {
            //use the rest bridge
            const paginationArgs = {}
            promise = this._restBridge.executeQuery(descriptor, decoratedCdt, paginationArgs)
        } else if (descriptor.service.protocol === 'custom') {
            //call the custom bridge
            //check if a bridge name is defined
            if (!_.isUndefined(descriptor.bridgeName) && !_.isEmpty(descriptor.bridgeName)) {
                //load the module
                promise = System
                    .import(this._bridgeFolder + descriptor.bridgeName)
                    .then(Module => {
                        const module = new Module.default()
                        return module.executeQuery(decoratedCdt)
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
                var startTransf = process.hrtime()
                //transform the response
                return this._transformResponse
                    .mappingResponse(response.response, descriptor)
                    .finally(() => {
                        if (this._metricsFlag) {
                            this._metrics.record('QueryHandler', 'mappingResponse', 'FUN', startTransf)
                        }
                    })
            })
            .catch(e => {
                console.log('[' + descriptor.service.name + '] ' + e)
                return Promise.resolve([])
            })
    }

}