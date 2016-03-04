'use strict'

import _ from 'lodash'
import Promise from 'bluebird'

export default class {

    constructor (queryHandler, responseAggregator) {
        this._queryHandler = queryHandler
        this._responseAggregator = responseAggregator
    }

    /**
     * Check if the current request can be fulfilled with the cached data or will be needed a new query to the services
     * @param userId The user's identifier
     * @param cachedObject The session object saved in cache
     * @param paginationArgs The pagination data requested
     * @returns {Promise|Promise.<T>} The updated session object
     */
    resolveResults (userId, cachedObject, paginationArgs) {
        let promises = []
        //check if a limit is specified
        if (_(paginationArgs).has('first')) {
            const first = paginationArgs.first
            //check the items already seen by the user
            let userInfo = _(cachedObject.users).find({userId: userId})
            let startIndex = 0
            if (!_.isUndefined(userInfo)) {
                startIndex = userInfo.itemSeen
            } else {
                //create entry for the new user
                userInfo = {
                    userId: userId,
                    itemSeen: 0
                }
                cachedObject.users.push(userInfo)
            }
            //check if I have enough items to return
            const len = cachedObject.results.length
            if (startIndex <= len - first - 1) {
                //if is specified the attribute "after" in the pagination arguments, I update the itemSeen value for the current user
                if (_(paginationArgs).has('after')) {
                    if (!_(userInfo).has('lastCursor') || userInfo.lastCursor !== paginationArgs.after) {
                        //update the information about the items seen by the user
                        userInfo.itemSeen = startIndex + first
                        userInfo.lastCursor = paginationArgs.after
                    }
                }
                //I have enough data to show
                console.log('[INFO] The system has enough data to be shown')
            } else {
                console.log('[INFO] Needed re-fetching of data')
                //need re-fetching of the services
                let serviceList = cachedObject.services
                //maintain only the services with another page to show
                serviceList = _(serviceList).filter({hasNextPage: true}).value()
                //check if some services can be queried
                if (!_.isEmpty(serviceList)) {
                    //make queries to the services
                    promises.push(this._queryHandler
                        .executeQueries(serviceList, cachedObject.decoratedCdt)
                        .then(responses => {
                            //aggregate the response received
                            return this._responseAggregator.prepareResponse(responses)
                        })
                        .then(response => {
                            //merge the new result set with the old one
                            if (!_.isUndefined(response.results))
                                cachedObject.results = _.concat(cachedObject.results, response.results)
                            //update the services pagination configuration
                            _(response.servicesStatus).forEach(service => {
                                let serviceItem = _(cachedObject.services).find(s => service.idOperation.equals(s._idOperation))
                                serviceItem.hasNextPage = service.hasNextPage
                                if (serviceItem.hasNextPage)
                                    serviceItem.nextPage = service.nextPage
                            })
                        }))
                }
            }
        } else {
            //return the full result set
            console.log('[INFO] No pagination setting specified')
        }
        //wait for completion
        return Promise
            .all(promises)
            .then(() => {
                return cachedObject
            })
    }

}