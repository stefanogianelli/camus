'use strict'

import _ from 'lodash'

/**
 * Acquire the service descriptor and the decorated CDT, then it compose the address where the service can be queried.
 * If more than one value are found in the CDT, it returns the first one. Instead, if a translation is mandatory, it returns the first valid translation value
 * @param {Object} descriptor - The service descriptor
 * @param {Object} decoratedCdt - The decorated CDT
 * @param {String} pageInfo - The number of page or the token of the current page to be queried
 * @returns {String} The complete address to query the service
 */
export function composeAddress (descriptor, decoratedCdt, pageInfo) {
    //configure parameters (the default ones are useful for standard query composition)
    let querySymbols = {
        start: '?',
        assign: '=',
        separator: '&'
    }
    //change parameter value if the service is REST
    if (descriptor.service.protocol === 'rest') {
        querySymbols.start = querySymbols.assign = querySymbols.separator = '/'
    }
    //setting up the base path of the service
    const baseAddress = descriptor.service.basePath + descriptor.path
    //get the complete list of nodes available for retrieve the values
    const nodes = _.concat(decoratedCdt.filterNodes, decoratedCdt.parameterNodes)
    //add the parameters to the query
    const parameters = _(descriptor.parameters).reduce((output, p) => {
        //case no mappings are defined
        if (_.isEmpty(p.mappingCDT) && _.isEmpty(p.mappingTerm)) {
            //use default value if the parameter is required and no mapping on the CDT was defined
            if (!_.isUndefined(p.default)) {
                if (_.isEmpty(output)) {
                    return p.name + querySymbols.assign + p.default
                } else {
                    return output + querySymbols.separator + p.name + querySymbols.assign + p.default
                }
            } else {
                if (p.required) {
                    //the service cannot be invoked
                    throw new Error('lack of required parameter \'' + p.name + '\'')
                }
            }
        } else {
            //acquire the values
            let values = ''
            let separator = ','
            switch (p.collectionFormat) {
                case 'csv':
                    separator = ','
                    break
                case 'ssv':
                    separator = ' '
                    break
                case 'tsv':
                    separator = '/'
                    break
                case 'pipes':
                    separator = '|'
                    break
            }
            //only one case is valid: retrieve values from the CDT or add term placeholders
            if (!_.isEmpty(p.mappingCDT)) {
                //search values in the CDT
                values = _(p.mappingCDT).reduce((output, m) => {
                    //search values in the CDT
                    const mappings = _searchMappings(nodes, m)
                    let value = undefined
                    //if I have more than one values, I return the first one. Instead, if a translation is needed, then I return the first valid translated value
                    _(mappings).forEach(mapping => {
                        if (_(p).has('translate') && !_.isEmpty(p.translate)) {
                            let translatedValue = _translateValue(mapping, p.translate)
                            if (!_.isEqual(translatedValue, mapping)) {
                                value = translatedValue
                                return false
                            }
                        } else {
                            value = mapping
                            return false
                        }
                    })
                    if (!_.isUndefined(value)) {
                        if (_.isEmpty(output)) {
                            return value
                        } else {
                            return output + separator + value
                        }
                    }
                }, '')
            } else {
                //use term instead of values
                values = _(p.mappingTerm).reduce((output, m) => {
                    if (_.isEmpty(output)) {
                        return m
                    } else {
                        return output + separator + m
                    }
                }, '')
                values = '{' + values + '}'
            }
            //add the found values to the parameter query part
            if (!_.isEmpty(values)) {
                if (_.isEmpty(output)) {
                    return p.name + querySymbols.assign + values
                } else {
                    return output + querySymbols.separator + p.name + querySymbols.assign + values
                }
            } else {
                if (p.required) {
                    //the service cannot be invoked
                    throw new Error('lack of required parameter \'' + p.name + '\'')
                }
            }
        }
    }, '')
    let address = baseAddress
    //if some parameters are found I add them to the base address
    if (!_.isEqual(parameters, '')) {
        address += querySymbols.start + parameters
    }
    //if is specified a start page, I add it to the address
    if (!_.isUndefined(pageInfo)) {
        address += descriptor.pagination.attributeName + querySymbols.assign + pageInfo
    }
    return address
}

/**
 * Search the values associated to a dimension in the CDT.
 * @param {Array} nodes - The nodes of the CDT to be taken into account
 * @param {String} name - The dimension's name
 * @returns {Array} The values found, if exist
 * @private
 */
function _searchMappings (nodes, name) {
    let names = name.split('.')
    let objs = []
    if (names.length > 0) {
        objs = _(nodes).filter({name: names[0]}).value()
    }
    if (!_.isUndefined(objs) && !_.isEmpty(objs)) {
        let output = []
        _(objs).forEach(obj => {
            if (names.length > 1) {
                output.push(_(obj.fields).find({name: names[1]}).value)
            } else {
                output.push(obj.value)
            }
        })
        return output
    }
}

/**
 * Translate a value into another, based on mapping rules.
 * A mapping rule consist in objects with the fields 'from' and 'to', where 'from' is the value to be searched
 * and 'to' is the output value.
 * @param {String} value - The current value
 * @param {Array} rules - The list of translation rules
 * @returns {String} The translated value, or the original value if no mappings are found
 * @private
 */
function _translateValue (value, rules) {
    for (let rule of rules) {
        if (rule.from === value) {
            return rule.to
        }
    }
    return value
}