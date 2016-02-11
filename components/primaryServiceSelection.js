'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'

import Provider from '../provider/provider'
import Metrics from '../utils/MetricsUtils'

const provider = new Provider()

let debug = false
if (config.has('debug')) {
    debug = config.get('debug')
}

let metricsFlag = false
if (config.has('metrics')) {
    metricsFlag = config.get('metrics')
}

let metrics = null
if (metricsFlag) {
    metrics = Metrics.getInstance()
}

/**
 * PrimaryServiceSelection
 */
export default class  {

    constructor () {
        //number of services to keep
        if (config.has('primaryService.n')) {
            this._n = config.get('primaryService.n')
        } else {
            this._n = 3
        }
        //filter nodes weight
        if (config.has('primaryService.weight.filter')) {
            this._filterWeight = config.get('primaryService.weight.filter')
        } else {
            this._filterWeight = 2
        }
        //ranking nodes weight
        if (config.has('primaryService.weight.ranking')) {
            this._rankingWeight = config.get('primaryService.weight.ranking')
        } else {
            this._rankingWeight = 4
        }
    }

    /**
     * Search the services that best fit the current context
     * @param {Object} decoratedCdt - The decorated CDT
     * @returns {Array} The ordered operations id
     */
    selectServices (decoratedCdt) {
        const startTime = process.hrtime()
        return new Promise(resolve => {
            Promise
                .join(
                    //search for services associated to the filter nodes
                    provider.filterPrimaryServices(decoratedCdt._id, decoratedCdt.filterNodes),
                    //search for services associated to the ranking nodes
                    provider.filterPrimaryServices(decoratedCdt._id, decoratedCdt.rankingNodes),
                    //search for specific associations
                    this._specificSearch(decoratedCdt._id, decoratedCdt.specificNodes)
                ,(filter, ranking, specific) => {
                    if (metricsFlag) {
                        metrics.record('PrimaryServiceSelection', 'getAssociations', startTime)
                    }
                    //merge the ranking and specific list (specific searches are considered ranking)
                    //discard the ranking nodes that haven't a correspondence in the filter nodes list
                        ranking = _(ranking)
                            .concat(specific)
                            .intersectionWith(filter, (s, i) => {
                                return s._idOperation.equals(i._idOperation)
                            })
                            .value()
                    //add the weight values for each item
                    _.forEach(filter, i => {
                        i['weight'] = this._filterWeight
                    })
                    _.forEach(ranking, i => {
                        i['weight'] = this._rankingWeight
                    })
                    //calculate the ranking of the merged list
                    resolve(this._calculateRanking(_.concat(filter, ranking)))
                })
                .catch(e => {
                    console.log('[ERROR]' + e)
                    resolve([])
                })
                .finally(() => {
                    if (metricsFlag) {
                        metrics.record('PrimaryServiceSelection', 'selectServices', startTime)
                    }
                })
        })
    }

    /**
     * This function dispatch the specific nodes to the correct search function.
     * It collects the results and return them to the main method
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Array} nodes - The list of specific nodes
     * @returns {Array} The list of associations found. Each association must be composed of an operation identifier and a ranking (starting from 1)
     * @private
     */
    _specificSearch (idCdt, nodes) {
        const start = process.hrtime()
        return new Promise (resolve => {
            let promises = []
            //check if the node dimension have a specific search associated
            _.forEach(nodes, node => {
                switch (node.name) {
                    case 'CityCoord':
                        //load specific coordinates search
                        promises.push(this._searchByCoordinates(idCdt, node))
                        break
                }
            })
            Promise
                .all(promises)
                .then(results => {
                    resolve(_.flatten(results))
                })
                .catch(e => {
                    console.log(e)
                    resolve()
                })
                .finally(() => {
                    if (metricsFlag) {
                        metrics.record('PrimaryServiceSelection', 'specificSearches', start)
                    }
                })
        })
    }

    /**
     * Compute the ranking of each operation found by the previous steps
     * @param {Object} services - The list of services, with own rank and weight
     * @returns {Array} The ranked list of Top-N services
     * @private
     */
    _calculateRanking (services) {
        if (debug) {
            console.log('Found ' + services.length + ' service/s')
        }
        const start = process.hrtime()
        let rankedList = []
        _.forEach(services, s => {
            //calculate the ranking of the current service
            let rank
            //avoid infinity results
            if (s.ranking > 0) {
                rank = s.weight * (1 / s.ranking)
            } else {
                rank = s.weight
            }
            //check if the service is already in the list
            let index = _.findIndex(rankedList, i => {
                return i._idOperation.equals(s._idOperation)
            })
            if (index === -1) {
                //if not exists creates the entry
                rankedList.push({
                    _idOperation: s._idOperation,
                    rank: rank
                })
            } else {
                //if exists update the rank
                rankedList[index].rank += rank
            }
        })
        //sort the list by the rank in descending order
        rankedList = _.orderBy(rankedList, 'rank', 'desc')
        //take only the first N services
        rankedList = _.take(rankedList, this._n)
        if (metricsFlag) {
            metrics.record('PrimaryServiceSelection', 'calculateRanking', start)
        }
        return rankedList
    }

    /**
     * Search associations by coordinates.
     * It also assigns a ranking starting from the nearest service
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The node with the coordinates
     * @returns {Array} The list of operation identifiers with ranking
     * @private
     */
    _searchByCoordinates (idCdt, node) {
        const start = process.hrtime()
        return provider
            .searchPrimaryByCoordinates(idCdt, node)
            .then(results => {
                if (metricsFlag) {
                    metrics.record('PrimaryServiceSelection', 'dbCoordinatesSearch', start)
                }
                if (debug) {
                    console.log('Found ' + results.length + ' service/s near the position')
                }
                return results
            })
            .map((result, index) => {
                return {
                    _idOperation: result._idOperation,
                    ranking: index + 1
                }
            })
            .finally(() => {
                if (metricsFlag) {
                    metrics.record('PrimaryServiceSelection', 'searchByCoordinates', start)
                }
            })
    }
}