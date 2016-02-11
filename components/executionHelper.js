'use strict'

import Promise from 'bluebird'

import ContextManager from './contextManager'
import PrimaryService from './primaryServiceSelection'
import QueryHandler from './queryHandler'
import SupportService from './supportServiceSelection'
import ResponseAggregator from './responseAggregator'
import UserManager from './userManager'
import Metrics from '../utils/MetricsUtils'
import config from 'config'

const contextManager = new ContextManager()
const primaryService = new PrimaryService()
const queryHandler = new QueryHandler()
const supportService = new SupportService()
const responseAggregator = new ResponseAggregator()
const userManager = new UserManager()

let metricsFlag = false
if (config.has('metrics')) {
    metricsFlag = config.get('metrics')
}

let metrics = null
if (metricsFlag) {
    metrics = Metrics.getInstance()
}

let timer = null

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
 * @param context The user context
 * @returns {Promise|Request|Promise.<T>} The decorated CDT
 */
export function getDecoratedCdt (context) {
    const start = process.hrtime()
    if (metricsFlag) {
        timer = _startTimer()
    }
    return contextManager
        .getDecoratedCdt(context)
        .finally(() => {
            if (metricsFlag) {
                metrics.record('ExecutionHelper', 'getDecoratedCdt', 'MAIN', start)
            }
        })
}

/**
 * From a decorated CDT, it returns the list of responses from the primary services
 * @param decoratedCdt The decorated CDT
 * @returns {*|Promise|Request|Promise.<T>} The list of items found
 */
export function getPrimaryData (decoratedCdt) {
    const start = process.hrtime()
    return primaryService
        .selectServices(decoratedCdt)
        .then(services => {
            return queryHandler
                .executeQueries(services, decoratedCdt)
        })
        .then(responses => {
            return responseAggregator
                .prepareResponse(responses)
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
    return userManager.login(mail, password)
}

/**
 * Retrieve the user's personal data. First it checks that the user is correctly logged in
 * @param {String} id - The user's identifier
 * @param {String} token - The session token associated to the user
 * @returns {Object} The CDT associated to the user
 */
export function getPersonalData (id, token) {
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