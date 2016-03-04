'use strict'

import Promise from 'bluebird'
import config from 'config'
import objectHash from 'object-hash'
import mongoose from 'mongoose'
import _ from 'lodash'

import ContextManager from './contextManager'
import PrimaryService from './primaryServiceSelection'
import QueryHandler from './queryHandler'
import SupportService from './supportServiceSelection'
import ResponseAggregator from './responseAggregator'
import UserManager from './userManager'
import Metrics from '../utils/MetricsUtils'
import Provider from '../provider/provider'
import SessionHelper from './sessionHelper'

const contextManager = new ContextManager()
const primaryService = new PrimaryService()
const queryHandler = new QueryHandler()
const supportService = new SupportService()
const responseAggregator = new ResponseAggregator()
const userManager = new UserManager()
const sessionHelper = new SessionHelper(queryHandler, responseAggregator)
const provider = Provider.getInstance()

const ObjectId = mongoose.Types.ObjectId

let metricsFlag = false
if (config.has('metrics')) {
    metricsFlag = config.get('metrics')
}

let metrics = null
if (metricsFlag) {
    metrics = Metrics.getInstance()
}

let timer = null

let sessionExpiration = 300
if (config.has('paginationTTL')) {
    sessionExpiration = config.get('paginationTTL')
}

/**
 * Given a user context, it invokes the components in the correct order, then return the final response
 * @param context The user context
 * @returns {Promise|Request|Promise.<T>} The final response
 */
export function prepareResponse (context) {
    const start = process.hrtime()
    if (metricsFlag) {
        timer = _startTimer()
    }
    return contextManager
        .getDecoratedCdt(context)
        .then(decoratedCdt => {
            return Promise
                .props({
                    data: primaryService
                        .selectServices(decoratedCdt)
                        .then(services => {
                            return queryHandler
                                .executeQueries(services, decoratedCdt)
                        })
                        .then(responses => {
                            return responseAggregator
                                .prepareResponse(responses)
                        }),
                    support: supportService.selectServices(decoratedCdt)
                })
        })
        .finally(() => {
            if (metricsFlag) {
                metrics.record('ExecutionHelper', 'executionTime', 'MAIN', start)
            }
        })
}

/**
 * Given a user context, it returns the associated decorated CDT
 * @param userId The user's identifier
 * @param context The user context
 * @returns {Promise|Request|Promise.<T>} The user's identifier, the context hash and the decorated CDT
 */
export function getDecoratedCdt (userId, context) {
    const start = process.hrtime()
    if (metricsFlag) {
        timer = _startTimer()
    }
    //check if the current context exists in cache
    const contextHash = objectHash.sha1(context)
    return provider
        .getRedisValue(contextHash)
        .then(result => {
            if (result) {
                //object found in cache
                let res = (JSON.parse(result)).decoratedCdt
                //cast the _id as ObjectId
                res._id = ObjectId(res._id)
                return {
                    userId: userId,
                    contextHash: contextHash,
                    decoratedCdt: res
                }
            }
            //parse the user context
            return contextManager
                .getDecoratedCdt(context)
                .then(decoratedCdt => {
                    return {
                        userId: userId,
                        contextHash: contextHash,
                        decoratedCdt: decoratedCdt
                    }
                })
        })
        .finally(() => {
            if (metricsFlag) {
                metrics.record('ExecutionHelper', 'getDecoratedCdt', 'MAIN', start)
            }
        })
}

/**
 * From a decorated CDT, it returns the list of responses from the primary services
 * @param userId The user's identifier
 * @param contextHash The context hash code
 * @param decoratedCdt The decorated CDT
 * @param paginationArgs Object with information about pagination status
 * @returns {*|Promise|Request|Promise.<T>} The list of items found
 */
export function getPrimaryData (userId, contextHash, decoratedCdt, paginationArgs) {
    const start = process.hrtime()
    //check if the necessary data are available in cache
    return provider
        .getRedisValue(contextHash)
        .then(result => {
            if (result) {
                //object found in cache
                console.log('[INFO] Retrieve results from cache')
                return sessionHelper
                    .resolveResults(userId, JSON.parse(result), paginationArgs)
                    .then(response => {
                        //update the cached information
                        provider.setRedisValue(contextHash, JSON.stringify(response), sessionExpiration)
                        //return the response
                        return response.results
                    })
            }
            //prepare the object that will be saved in cache
            let cacheObj = {
                decoratedCdt: decoratedCdt,
                services: [],
                results: [],
                users: [
                    {
                        userId: userId,
                        itemSeen: 0
                    }
                ]
            }
            //start the standard process
            return primaryService
                //acquire the services list
                .selectServices(decoratedCdt)
                .then(services => {
                    //add the service found to the cached object
                    cacheObj.services = services
                    //request data from the selected services
                    return queryHandler.executeQueries(services, decoratedCdt)
                })
                .then(responses => {
                    //aggregate the response received
                    return responseAggregator.prepareResponse(responses)
                })
                .then(response => {
                    //check if the response contains al least one item
                    if (!_.isEmpty(response.results)) {
                        //add the results set to the cached object
                        cacheObj.results = response.results
                        //updated services list with information about current pagination status
                        _(response.servicesStatus).forEach(service => {
                            let serviceItem = _(cacheObj.services).find({_idOperation: service.idOperation})
                            serviceItem.hasNextPage = service.hasNextPage
                            if (serviceItem.hasNextPage)
                                serviceItem.nextPage = service.nextPage
                        })
                        //save the object in redis
                        provider.setRedisValue(contextHash, JSON.stringify(cacheObj), sessionExpiration)
                    }
                    return response.results
                })
        })
        .finally(() => {
            if (metricsFlag) {
                metrics.record('ExecutionHelper', 'getPrimaryData', 'MAIN', start)
            }
        })
}

/**
 * From a decorated CDT, it returns the list of support services
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of support services found
 */
export function getSupportData (decoratedCdt) {
    const start = process.hrtime()
    return supportService
        .selectServices(decoratedCdt)
        .finally(() => {
            if (metricsFlag) {
                metrics.record('ExecutionHelper', 'getSupportData', 'MAIN', start)
            }
        })
}

/**
 * User login method
 * @param mail The user's email address
 * @param password The user's password
 * @returns {Object} The user's identifier and session token
 */
export function login (mail, password) {
    if (metricsFlag) {
        timer = _startTimer()
    }
    return userManager.login(mail, password)
}

/**
 * Retrieve the user's personal data. First it checks that the user is correctly logged in
 * @param {String} id - The user's identifier
 * @param {String} token - The session token associated to the user
 * @returns {Object} The CDT associated to the user
 */
export function getPersonalData (id, token) {
    if (metricsFlag) {
        timer = _startTimer()
    }
    return userManager.getPersonalData(id, token)
}

/**
 * Start the timer for saving the metrics results
 * @returns {Object} The timeout object
 * @private
 */
function _startTimer () {
    clearTimeout(timer)
    return setTimeout(() => {
        metrics.saveResults()
    }, 4000)
}