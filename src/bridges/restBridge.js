'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import agent from 'superagent'
import config from 'config'

import Bridge from './bridge'
import Provider from '../provider/provider'
import Metrics from '../utils/MetricsUtils'
import * as Composer from '../utils/QueryComposer'

/**
 * Bridge implementation for REST and Query services
 */
export default class extends Bridge {

    constructor () {
        super()
        //timeout for the requests (in ms)
        this._timeout = 3000
        if (config.has('rest.timeout.service')) {
            this._timeout = config.get('rest.timeout.service')
        }
        //validity time for cache content (in s)
        this._cacheTTL = 1800
        if (config.has('rest.timeout.cache')) {
            this._cacheTTL = config.get('rest.timeout.cache')
        }
        //initialize provider
        this._provider = Provider.getInstance()
        //initialize debug flag
        this._debug = false
        if (config.has('debug')) {
            this._debug = config.get('debug')
        }
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
     * It makes the query to the selected service and returns the results
     * First it executes the mapping between the service parameters and the values in the CDT.
     * Then compose the query and invoke the service.
     * @param {Object} descriptor - The service description, with the information about how to handle the service
     * @param {Object} decoratedCdt - The decorated CDT
     * @param {Object} paginationArgs - Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {Promise<Object>} The promise for the service responses. The object format is the same as @see {@link _invokeService} method
     */
    executeQuery (descriptor, decoratedCdt, paginationArgs) {
        const startTime = process.hrtime()
        return this
            ._invokeService(descriptor, decoratedCdt, paginationArgs)
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('RestBridge', 'executeQuery/' + descriptor.service.name, 'MAIN', startTime)
                }
            })
    }

    /**
     * Compose the address of the service, add the header information and call the service.
     * Then return the service parsed response.
     * @param {Object} descriptor - The service description
     * @param {Object} decoratedCdt - The decoratedCdt
     * @param {Object} pagination - Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {Promise<Object>} The parsed response with metadata about the status of the query. The response is composed as follow:
     * {
     *  {Boolean} hasNextPage: true if the service can be requered in future to acquire new data
     *  {String|Number} nextPage: the token or the number that will be used to retrieve the next page
     *  {Array} response: the list of data received from the current query
     * }
     * @private
     */
    _invokeService (descriptor, decoratedCdt, pagination) {
        const start = process.hrtime()
        //acquire pagination parameters
        let startPage = this._getStartPage(descriptor, pagination)
        //get the service address
        let fullAddress = ''
        try {
            fullAddress = Composer.composeAddress(descriptor, decoratedCdt, startPage)
        } catch (err) {
            return Promise.reject(err.message)
        }
        if (this._debug) {
            console.log('Querying service \'' + descriptor.service.name + '\': ' + fullAddress)
        }
        return this
            ._makeCall(fullAddress, descriptor.headers, descriptor.service.name)
            .then(response => {
                //acquire next page information
                let {hasNextPage, nextPage} = this._getPaginationStatus(descriptor, startPage, response)
                if (this._metricsFlag) {
                    this._metrics.record('RestBridge', 'invokeService/' + descriptor.service.name, 'FUN', start)
                }
                return {
                    hasNextPage: hasNextPage,
                    nextPage: nextPage,
                    response: response
                }
            })
    }

    /**
     * Make a request to the current web service and retrieve the response.
     * @param {String} address - The service's address
     * @param {Array} headers - The header values to be appended to the request
     * @param {String} service - The service name, used only for metrics logging
     * @returns {Promise<Object>} The service response
     * @private
     */
    _makeCall (address, headers, service) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            //check if a copy of the response exists in the cache
            this._provider
                .getRedisValue(address)
                .then((result) => {
                    if (result) {
                        if (this._metricsFlag) {
                            this._metrics.record('RestBridge', 'accessCache/' + service, 'CACHE', start)
                        }
                        //return immediately the cached response
                        return resolve(JSON.parse(result))
                    } else {
                        //send a new request
                        //creating the agent
                        let request = agent.get(address)
                        //adding header information
                        _(headers).forEach(h => {
                            request.set(h.name, h.value)
                        })
                        //setting timeout
                        request.timeout(this._timeout)
                        //invoke the service and return the response
                        request.end((err, res) => {
                            if (err) {
                                switch (err.status) {
                                    case 400:
                                        reject('bad request. Check the address and parameters (400)')
                                        break
                                    case 401:
                                        reject('access to a restricted resource (401)')
                                        break
                                    case 404:
                                        reject('service not found (404)')
                                        break
                                    case 500:
                                        reject('server error (500)')
                                        break
                                    default:
                                        reject(err)
                                }
                            } else {
                                let response
                                if (!_.isEmpty(res.body)) {
                                    response = res.body
                                } else {
                                    response = JSON.parse(res.text)
                                }
                                //caching the response (with associated TTL)
                                this._provider.setRedisValue(address, res.text, this._cacheTTL)
                                if (this._metricsFlag) {
                                    this._metrics.record('RestBridge', 'makeCall/' + service, 'EXT', start)
                                }
                                return resolve(response)
                            }
                        })
                    }
                })
        })
    }

    /**
     * Check the pagination status for the current service.
     * The status is composed by the information if another information page is available and what is the identifier to retrieve it.
     * @param {Object} descriptor - The service description
     * @param {Number} currentPage - The last page queried, used only for 'number' pagination type
     * @param {Object} response - The last response received by the service
     * @returns {Object} Return the status of the service's query. This object is created as follow:
     * {
     *  {Boolean} hasNextPage: specify if exists another page to be queried
     *  {String|Number} nextPage: define the identifier of the following page, and can be a number or a token depends on the service implementation
     * }
     * @private
     */
    _getPaginationStatus (descriptor, currentPage, response) {
        let hasNextPage = false
        let nextPage = null
        //check if the service has pagination parameters associated
        if (_(descriptor).has('pagination')) {
            const paginationConfig = descriptor.pagination
            //acquire the next page identifier
            if (paginationConfig.type === 'number') {
                //initialize the first page
                if (_.isNull(currentPage)) {
                    currentPage = 1
                }
                //get the pages count
                try {
                    let count = Number(response[paginationConfig.pageCountAttribute])
                    //check if can I acquire a new page
                    if (currentPage + 1 <= count) {
                        nextPage = currentPage + 1
                        hasNextPage = true
                    }
                } catch (e) {
                    console.log('Invalid page count value')
                }
            } else if (paginationConfig.type === 'token') {
                //get the next token
                let nextToken = response[paginationConfig.tokenAttribute]
                //check if the token is valid
                if (!_.isUndefined(nextToken) && !_.isEmpty(nextToken)) {
                    nextPage = nextToken
                    hasNextPage = true
                }
            }
        }
        return {
            hasNextPage,
            nextPage
        }
    }

    /**
     * Define the initial status of pagination attributes.
     * @param {Object} descriptor The service description
     * @param {Object} paginationArgs The pagination arguments received by the caller
     * @returns {String} The startPage attribute defines the starting identifier that will be queried
     * @private
     */
    _getStartPage (descriptor, paginationArgs) {
        let startPage = null
        //check if the service has pagination parameters associated
        if (_(descriptor).has('pagination') && !_.isUndefined(paginationArgs)) {
            //check if exists a start page placeholder
            if (!_.isUndefined(paginationArgs.startPage)) {
                startPage = paginationArgs.startPage
            }
        }
        return startPage
    }
}