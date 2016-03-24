'use strict'

/**
 * This class initialize the other system's components and orchestrate the pipelines needed to retrieve the necessary data
 */

import Promise from 'bluebird'
import config from 'config'
import objectHash from 'object-hash'
import mongoose from 'mongoose'
import hat from 'hat'
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

let sessionExpiration = 1800
if (config.has('paginationTTL')) {
    sessionExpiration = config.get('paginationTTL')
}

/**
 * Given a user context, it returns the associated decorated CDT
 * @param {String} userMail - The user's mail address
 * @param {Object} context - The user's context
 * @returns {Promise<Object>} The decorated CDT object, composed as follow:
 * {
 *  {ObjectId} userId: the user's identifier
 *  {String} contextHash: the unique identifier for the current context
 *  {Object} decoratedCdt: the decorated CDT, based on the user's context received
 *  {String} connectionId: the connection's identifier
 * }
 */
export function getDecoratedCdt (userMail, context) {
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
                let res = JSON.parse(result)
                //cast the _id as ObjectId
                res.decoratedCdt._id = ObjectId(res._id)
                return {
                    userMail: userMail,
                    contextHash: contextHash,
                    decoratedCdt: res.decoratedCdt,
                    connectionId: res.connectionId
                }
            }
            //parse the user context
            return contextManager
                .getDecoratedCdt(context)
                .then(decoratedCdt => {
                    return {
                        userMail: userMail,
                        contextHash: contextHash,
                        decoratedCdt: decoratedCdt,
                        connectionId: hat()
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
 * Based on a decorated CDT, it returns the list of items from the primary services
 * @param {String} userMail - The user's mail address
 * @param {String} contextHash - The context's hash code
 * @param {Object} decoratedCdt - The decorated CDT
 * @param {Object} paginationArgs - Object with information about pagination status provided by GraphQL
 * @param {String} connectionId - The connection's identifier, to aggregate the requests from the same connection
 * @returns {Promise<Array>} The list of items found
 */
export function getPrimaryData (userMail, contextHash, decoratedCdt, paginationArgs, connectionId) {
    const start = process.hrtime()
    //check if the necessary data are available in cache
    return provider
        .getRedisValue(contextHash)
        .then(result => {
            if (result) {
                //object found in cache
                console.log('[INFO] Retrieve results from cache')
                return sessionHelper
                    .resolveResults(userMail, JSON.parse(result), paginationArgs)
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
                connectionId: connectionId,
                services: [],
                results: [],
                users: [
                    {
                        user: userMail,
                        itemSeen: paginationArgs.first || 0
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
 * Based on a decorated CDT, it returns the list of support services URLs
 * @param {Object} decoratedCdt - The decorated CDT
 * @returns {Promise<Array>} The list of support services found
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
 * Method to allow user authentication
 * @param {String} mail - The user's email address
 * @param {String} password - The user's password
 * @returns {Promise<Object>} The user's identifier and session token
 */
export function login (mail, password) {
    if (metricsFlag) {
        timer = _startTimer()
    }
    return userManager.login(mail, password)
}

/**
 * Retrieve the user's personal data.
 * First it checks that the user is correctly logged in
 * @param {String} mail - The user's email address
 * @param {String} token - The session token associated to the user
 * @returns {Promise<Object>} The CDT associated to the user
 */
export function getPersonalData (mail, token) {
    if (metricsFlag) {
        timer = _startTimer()
    }
    return userManager.getPersonalData(mail, token)
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