'use strict';

import Promise from 'bluebird';

import ContextManager from './contextManager';
import PrimaryService from './primaryServiceSelection';
import QueryHandler from './queryHandler';
import SupportService from './supportServiceSelection';
import ResponseAggregator from './responseAggregator';
import Metrics from '../utils/MetricsUtils';
import config from 'config';
import util from 'util';

const contextManager = new ContextManager();
const primaryService = new PrimaryService();
const queryHandler = new QueryHandler();
const supportService = new SupportService();
const responseAggregator = new ResponseAggregator();

let debug = false;
if (config.has('debug')) {
    debug = config.get('debug');
}

let metrics = null;
if (debug) {
    const filePath = __dirname.replace('components', '') + '/metrics/ExecutionHelper.txt';
    metrics = new Metrics(filePath);
}

/**
 * Given a user context, it invokes the components in the correct order, then return the final response
 * @param context The user context
 * @returns {Promise|Request|Promise.<T>} The final response
 */
export function prepareResponse (context) {
    const start = process.hrtime();
    return contextManager
        .getDecoratedCdt(context)
        .then(decoratedCdt => {
            return Promise
                .props({
                    data: primaryService
                        .selectServices(decoratedCdt)
                        .then(services => {
                            return queryHandler
                                .executeQueries(services, decoratedCdt);
                        })
                        .then(responses => {
                            return responseAggregator
                                .prepareResponse(responses);
                        }),
                    support: supportService.selectServices(decoratedCdt)
                });
        })
        .finally(() => {
            if (debug) {
                metrics.record('executionTime', start);
                metrics.saveResults();
            }
        });
}

/**
 * Given a user context, it returns the associated decorated CDT
 * @param context The user context
 * @returns {Promise|Request|Promise.<T>} The decorated CDT
 */
export function getDecoratedCdt (context) {
    return contextManager
        .getDecoratedCdt(context);
}

/**
 * From a decorated CDT, it returns the list of responses from the primary services
 * @param decoratedCdt The decorated CDT
 * @returns {*|Promise|Request|Promise.<T>} The list of items found
 */
export function getPrimaryData (decoratedCdt) {
    return primaryService
        .selectServices(decoratedCdt)
        .then(services => {
            return queryHandler
                .executeQueries(services, decoratedCdt);
        })
        .then(responses => {
            return responseAggregator
                .prepareResponse(responses);
        });
}

/**
 * From a decorated CDT, it returns the list of support services
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of support services found
 */
export function getSupportData (decoratedCdt) {
    return supportService
        .selectServices(decoratedCdt);
}