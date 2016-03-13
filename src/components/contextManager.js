'use strict'

import _ from 'lodash'
import Promise from 'bluebird'
import config from 'config'

import Provider from '../provider/provider'
import Metrics from '../utils/MetricsUtils'

/**
 * The Context Manager receive the user's context and transform it in a 'decorated' version, more suitable for the next elaborations
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
     * It takes as input the user's context and transform it into the decorated one.
     * This context is first merged with the full CDT in the database.
     * Decorated CDT mean an object composed in this way:
     * - filterNodes: the list of filter nodes (also include the descendants of each node)
     * - rankingNodes: the list of ranking nodes (also include the descendants of each node)
     * - specificNodes: the list of specific nodes (assumed that they are ranking nodes)
     * - parametersNodes: the list of parameter nodes
     * - supportServiceCategories: the list of categories for which retrieve the support services
     * @param {Object} context - The user's context
     * @returns {Promise<Object>} The decorated CDT
     */
    getDecoratedCdt (context) {
        const startTime = process.hrtime()
        return this
            //merge the CDT full description with the values from the user's context
            ._mergeCdtAndContext(context)
            .then(({cdt, mergedCdt}) => {
                return Promise
                    .join(
                        //find the filter nodes
                        this._getFilterNodes(mergedCdt.context, cdt),
                        //find the ranking nodes
                        this._getRankingNodes(mergedCdt.context, cdt),
                        //find the specific nodes
                        this._getSpecificNodes(mergedCdt.context),
                        //find the parameter nodes
                        this._getParameterNodes(mergedCdt.context),
                        (filterNodes, rankingNodes, specificNodes, parameterNodes) => {
                            return {
                                _id: mergedCdt._id,
                                filterNodes: filterNodes,
                                rankingNodes: rankingNodes,
                                specificNodes: specificNodes,
                                parameterNodes: parameterNodes,
                                supportServiceCategories: mergedCdt.support
                            }
                        }
                    )
            })
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('ContextManager', 'getDecoratedCdt', 'MAIN', startTime)
                }
            })
    }

    /**
     * Find the current CDT and add values for the dimension and parameters node from the user context
     * @param {Object} context - The user's context
     * @returns {Promise<Object>} The merged CDT
     * @throws {Error} If the CDT is not found in the database
     * @private
     */
    _mergeCdtAndContext (context) {
        const startTime = process.hrtime()
        return this._provider
            .getCdtById(context.idCdt)
            .then(cdt => {
                if (this._metricsFlag) {
                    this._metrics.record('ContextManager', 'getCdt', 'MAINDB', startTime)
                }
                //create the map of user context values
                let mapContext = this._createMap(context.context)
                //merging the CDT description with the user context
                let mergedContext = this._mergeObjects(cdt.context, mapContext)
                //create the final object
                let mergedCdt = {
                    _id: cdt._id,
                    context: mergedContext
                }
                if (_(context).has('support')) {
                    mergedCdt.support = context.support
                }
                return {cdt, mergedCdt}
            })
            .finally(() => {
                if (this._metricsFlag) {
                    this._metrics.record('ContextManager', 'mergeCdtAndContext', 'FUN', startTime)
                }
            })
    }

    /**
     * Create a map of the user's context values
     * @param {Array} list - The user context
     * @returns {Map} The map with all the active selection made by the user
     * @private
     */
    _createMap (list) {
        let map = new Map()
        _(list).forEach (item => {
            if (_(item).has('dimension') && _(item).has('value')) {
                if (!map.has(item.dimension)) {
                    map.set(item.dimension, item.value)
                }
            }
            if (_(item).has('parameters')) {
                _(item.parameters).forEach(param => {
                    if (_(param).has('name') && _(param).has('value')) {
                        if (!map.has(param.name)) {
                            map.set(param.name, param.value)
                        }
                    }
                    if (_(param).has('fields')) {
                        param.fields.forEach(field => {
                           if (_(field).has('name') && _(field).has('value')) {
                               if (!map.has(field.name)) {
                                   map.set(field.name, field.value)
                               }
                           }
                        })
                    }
                })
            }
        })
        return map
    }

    /**
     * Merge the CDT description with the user's context values
     * @param {Array} list - The list of CDT items (context, parameter, field)
     * @param {Map} map - The map containing the user's context
     * @returns {Array} The merged list of CDT items
     * @private
     */
    _mergeObjects (list, map) {
        let output = []
        _(list).forEach(item => {
            let addObject = false
            //get the dimension name
            let dim = item.name
            //acquire the value from the user context, if exists
            let value = undefined
            if (map.has(dim)) {
                value = map.get(dim)
                addObject = true
            }
            //check if the item has parameters
            let parameters = []
            if (!_.isEmpty(item.parameters)) {
                parameters = this._mergeObjects(item.parameters, map)
                if (!_.isEmpty(parameters)) {
                    addObject = true
                }
            }
            //check if the item has fields
            let fields = []
            if (!_.isEmpty(item.fields)) {
                fields = this._mergeObjects(item.fields, map)
                if (!_.isEmpty(fields)) {
                    addObject = true
                }
            }
            //create the resultant object
            if (addObject) {
                let obj = {
                    name: dim
                }
                if (_(item).has('for')) {
                    obj.for = item.for
                }
                if (_(item).has('parents')) {
                    obj.parents = item.parents
                }
                if (!_.isUndefined(value)) {
                    obj.value = value
                }
                if (!_.isEmpty(parameters)) {
                    obj.parameters = parameters
                }
                if (!_.isEmpty(fields)) {
                    obj.fields = fields
                }
                output.push(obj)
            }
        })
        return output
    }

    /**
     * Return the list of filter nodes, with the descendants of the selected nodes
     * @param {Object} mergedCdt - The merged CDT
     * @param {Object} cdt - The full CDT object
     * @returns {Array} The list of filter nodes
     * @private
     */
    _getFilterNodes (mergedCdt, cdt) {
        const startTime = process.hrtime()
        let results = this._getNodes('filter', mergedCdt, false)
        if (!_.isEmpty(results)) {
            results = _.concat(results, this._getDescendants(cdt, results))
        }
        if (this._metricsFlag) {
            this._metrics.record('ContextManager', 'getFilterNodes', 'FUN', startTime)
        }
        return results
    }

    /**
     * Return the list of ranking nodes, with the descendants of the selected nodes
     * @param {Object} mergedCdt - The merged CDT
     * @param {Object} cdt - The full CDT object
     * @returns {Array} The list of ranking nodes
     * @private
     */
    _getRankingNodes (mergedCdt, cdt) {
        const startTime = process.hrtime()
        let results = this._getNodes('ranking', mergedCdt, false)
        if (!_.isEmpty(results)) {
            results = _.concat(results, this._getDescendants(cdt, results))
        }
        if (this._metricsFlag) {
            this._metrics.record('ContextManager', 'getRankingNodes', 'FUN', startTime)
        }
        return results
    }

    /**
     * The list of parameter nodes. Are also taken into account the specific nodes
     * @param {Object} mergedCdt - The merged CDT
     * @returns {Array} The list of parameter nodes
     * @private
     */
    _getParameterNodes (mergedCdt) {
        const startTime = process.hrtime()
        let results = _.concat(
            this._getNodes('parameter', mergedCdt, false),
            this._getNodes('parameter', mergedCdt, true)
        )
        if (this._metricsFlag) {
            this._metrics.record('ContextManager', 'getParameterNodes', 'FUN', startTime)
        }
        return results
    }

    /**
     * Return the list of specific nodes.
     * It assumes that the specific nodes belong to the ranking category
     * @param {Object} mergedCdt The list of items (the merged CDT)
     * @returns {Array} The list of specific nodes
     * @private
     */
    _getSpecificNodes (mergedCdt) {
        const startTime = process.hrtime()
        let results = this._getNodes('ranking', mergedCdt, true)
        if (this._metricsFlag) {
            this._metrics.record('ContextManager', 'getSpecificNodes', 'FUN', startTime)
        }
        return results
    }

    /**
     * Find the nodes that belong to the specified type.
     * The valid types are: filter, ranking and parameter.
     * The parameter attached to a dimension are flattened to the root level.
     * Instead, the internal fields of a parameter are leave as they are.
     * This function doesn't take into account the dimensions that are labelled as specific, except when the specific flag is not set.
     * @param {String} type - The type of nodes
     * @param {Array} items - The list of item (the merged CDT)
     * @param {Boolean} specificFlag - If true it searches for specific nodes
     * @returns {Array} The list of nodes found
     * @private
     */
    _getNodes (type, items, specificFlag) {
        if (_.isEqual(type, 'filter') || _.isEqual(type, 'ranking') || _.isEqual(type, 'parameter')) {
            if (!_.isUndefined(items) && !_.isEmpty(items)) {
                //filter the items that belongs to the selected category
                items = _(items).filter(item => _(item.for).includes(type)).value()
                let list = []
                let index = 0
                //according to the value of the specific flag, select or discard the specific nodes
                //a parameter with multiple fields defined it's considered as specific
                if (specificFlag) {
                    //consider only the specific nodes (the parameter items are flattened to the root)
                    _(items)
                        .filter('parameters')
                        .forEach(item => {
                            _(item.parameters).forEach(p => {
                                if (_(p).has('fields') && !_.isEmpty(p.fields)) {
                                    list[index++] = p
                                }
                            })
                        })
                } else {
                    //reject the specific nodes
                    //the dimension and parameter nodes are flattened to the root
                    _(items).forEach(item => {
                        if (_(item).has('value')) {
                            list[index++] = item
                        } else if (_(item).has('parameters')) {
                            _(item.parameters).forEach(p => {
                                if (!_(p).has('fields')) {
                                    list[index++] = p
                                }
                            })
                        }
                    })
                }
                return _(list)
                    .map(item => {
                        if (_(item).has('fields')) {
                            return {
                                name: item.name,
                                fields: item.fields
                            }
                        } else {
                            return {
                                name: item.name,
                                value: item.value
                            }
                        }
                    })
                    .value()
            } else {
                throw new Error('No items selected')
            }
        } else {
            throw new Error('Invalid type selected')
        }
    }

    /**
     * Retrieve the list of descendant nodes for the selected list of nodes
     * @param {Object} cdt - The full CDT description
     * @param {Array} nodes - The list of nodes found
     * @returns {Array} The list of descendant nodes
     * @private
     */
    _getDescendants (cdt, nodes) {
        const startTime = process.hrtime()
        let output = []
        const nodeValues = _(nodes).map('value').value()
        _(cdt.context).forEach(item => {
            const intersect = _.intersection(item.parents, nodeValues)
            if (!_.isEmpty(intersect) && _(item).has('values')) {
                _(item.values).forEach(value => {
                    output.push({
                        name: item.name,
                        value: value
                    })
                })
            }
        })
        if (this._metricsFlag) {
            this._metrics.record('ContextManager', 'getDescendants', 'FUN', startTime)
        }
        return output
    }
}