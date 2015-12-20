'use strict';

import Promise from 'bluebird';

import ContextManager from './contextManager';
import PrimaryService from './primaryServiceSelection';
import QueryHandler from './queryHandler';
import SupportService from './supportServiceSelection';
import ResponseAggregator from './responseAggregator';

const contextManager = new ContextManager();
const primaryService = new PrimaryService();
const queryHandler = new QueryHandler();
const supportService = new SupportService();
const responseAggregator = new ResponseAggregator();

export default class ExecutionHelper {

    /**
     * Given a user context, it invokes the components in the correct order, then return the final response
     * @param context The user context
     * @returns {Promise|Request|Promise.<T>} The final response
     */
    prepareResponse (context) {
        return contextManager
            .getDecoratedCdt(context)
            .then(decoratedCdt => {
                return Promise
                    .props({
                        primary: primaryService
                            .selectServices(decoratedCdt)
                            .then(services => {
                                return queryHandler
                                    .executeQueries(services, decoratedCdt);
                            }),
                        support: supportService.selectServices(decoratedCdt)
                    });
            })
            .then(result => {
                return responseAggregator.prepareResponse(result.primary, result.support);
            });
    }
    
}