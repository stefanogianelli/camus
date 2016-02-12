'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'

import Provider from '../provider/provider'
import Metrics from '../utils/MetricsUtils'

/**
 * SupportServiceSelection
 */
export default class {

    constructor () {
        //initialize provider
        this._provider = Provider.getInstance()
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
     * Create the list of support services associated to the current context
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of services, with the query associated
     */
    selectServices (decoratedCdt) {
        const startTime = process.hrtime()
        return this
            ._selectServiceFromCategory(decoratedCdt.supportServiceCategories, decoratedCdt)
            .catch(err => {
                console.log('[ERROR] ' + err)
                return []
            })
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('SupportServiceSelection', 'selectServices', 'MAIN', startTime)
                }
            })
    }

    /**
     * Select the services associated to a category
     * @param categories The list of categories
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
     * @private
     */
    _selectServiceFromCategory (categories, decoratedCdt) {
        const start = process.hrtime()
        if (!_.isUndefined(categories) && !_.isEmpty(categories) && !_.isEmpty(decoratedCdt.filterNodes)) {
            let nodes = decoratedCdt.filterNodes
            if (!_.isEmpty(decoratedCdt.rankingNodes)) {
                nodes = _.concat(decoratedCdt.filterNodes, decoratedCdt.rankingNodes)
            }
            return Promise
                .map(categories, c => {
                    return Promise
                        .join(
                            this._provider.filterSupportServices(decoratedCdt._id, c, nodes),
                            this._specificSearch(decoratedCdt._id, decoratedCdt.specificNodes),
                            (filterServices, customServices) => {
                                if (this._metricsFlag) {
                                    this._metrics.record('SupportServiceSelection', 'getAssociations', 'DB', start)
                                }
                                //acquire constraint count information
                                const ids = _(filterServices).unionWith(customServices, (arrVal, othVal) => arrVal._idOperation.equals(othVal._idOperation)).value()
                                return this._provider
                                    .getServicesConstraintCount(decoratedCdt._id, c, _.map(ids, '_idOperation'))
                                    .then(constraintCount => {
                                        return this._mergeResults(filterServices, customServices, constraintCount)
                                    })
                            }
                        )
                        .then(identifiers => {
                            return this._provider.getServicesByOperationIds(identifiers)
                        })
                        .then(services => {
                            //compose the queries
                            return this._composeQueries(services, c)
                        })
                })
                .reduce((a, b) => {
                    return _.concat(a,b)
                })
        } else {
            return Promise.resolve([])
        }
    }

    /**
     * Create the final list of support services selected for a specific category
     * @param filterServices The services found by the standard search
     * @param customServices The services found by the custom searches
     * @param constraintCount The count of the constraints associated to a service
     * @returns {Array} The operation identifiers of the selected support services
     * @private
     */
    _mergeResults (filterServices, customServices, constraintCount) {
        const start = process.hrtime()
        let results = []
        _(filterServices)
            .concat(customServices)
            .forEach(s => {
                //search if the current operation already exists in the results collection
                let index = _(results).findIndex(i => i._idOperation.equals(s._idOperation))
                if (index === -1) {
                    //operation not found, so I create a new object
                    const count = _(constraintCount).find(o => o._idOperation.equals(s._idOperation)).constraintCount
                    results.push({
                        _idOperation: s._idOperation,
                        constraintCount: count,
                        count: 1
                    })
                } else {
                    //operation found, so I increase the counter
                    results[index].count += 1
                }
            })
        //get the maximum value of the count attribute
        const maxCount = _(results).maxBy('count').count
        //filter out the operations with the maximum count value and that respect their total constraint counter
        results = _(results)
            .filter(r => (r.count === maxCount && r.constraintCount === r.count))
            .map('_idOperation')
            .value()
        if (this._metricsFlag) {
            this._metrics.record('SupportServiceSelection', 'mergeResults', 'FUN', start)
        }
        return results
    }

    /**
     * Compose the queries of the selected services
     * @param services The list of services
     * @param category (optional) The service category
     * @returns {Array} The list of services with the composed queries
     * @private
     */
    _composeQueries (services, category) {
        return _(services)
            .map(s => {
                //configure parameters (the default ones are useful for standard query composition)
                let start = '?'
                let assign = '='
                let separator = '&'
                //change parameter value if the service is REST
                if (s.service.protocol === 'rest') {
                    start = assign = separator = '/'
                }
                //add the base path and the operation path to the address
                let address = s.service.basePath + s.path + start
                //compose the parameters part of the query
                let output = _(s.parameters).reduce((output, p) => {
                    let values
                    if (_.isEmpty(p.mappingTerm)) {
                        //if no term is associated use the default value
                        values = p.default
                    } else {
                        // compose the values part of the parameter
                        let valueSeparator = ','
                        //select the correct separator (the default one is the comma)
                        switch (p.collectionFormat) {
                            case 'csv':
                                valueSeparator = ','
                                break
                            case 'ssv':
                                valueSeparator = ' '
                                break
                            case 'tsv':
                                valueSeparator = '/'
                                break
                            case 'pipes':
                                valueSeparator = '|'
                                break
                        }
                        //concatenate one or more terms, separated by the symbol selected above
                        values = _(p.mappingTerm).reduce((values, m) => {
                            if (_.isEmpty(values)) {
                                return m
                            } else {
                                return values + valueSeparator + m
                            }
                        }, '')
                        values = '{' + values + '}'
                    }
                    //add the value(s) to the query
                    if (_.isEmpty(output)) {
                        return p.name + assign + values
                    } else {
                        return output + separator + p.name + assign + values
                    }
                }, '')
                //return the object
                if (!_.isUndefined(category) && !_.isEmpty(category)) {
                    return {
                        category: category,
                        service: s.service.name,
                        url: address + output
                    }
                } else {
                    return {
                        name: s.service.name,
                        url: address + output
                    }
                }
            })
            .value()
    }

    /**
     * This function dispatch the specific nodes to the correct search function.
     * It collects the results and return them to the main method
     * @param idCdt The CDT identifier
     * @param nodes The list of specific ndoes
     * @returns {bluebird|exports|module.exports} The list of associations found. Each association must be composed of an operation identifier
     * @private
     */
    _specificSearch (idCdt, nodes) {
        let promises = []
        //check if the node dimension have a specific search associated
        _(nodes).forEach(node => {
            switch (node.name) {
                case 'CityCoord':
                    //load specific coordinates search
                    promises.push(this._searchByCoordinates(idCdt, node))
                    break
            }
        })
        return Promise
            .all(promises)
            .then(results => {
                return _.flatten(results)
            })
    }

    /**
     * Search associations by coordinates.
     * @param idCdt The CDT identifier
     * @param node The node with the coordinates
     * @returns {Promise.<T>} The list of operation identifiers
     * @private
     */
    _searchByCoordinates (idCdt, node) {
        return this._provider.searchSupportByCoordinates(idCdt, node)
    }
}