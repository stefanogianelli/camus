'use strict'

import _ from 'lodash'

/**
 * Abstract class for every Bridge.
 * Each bridge must implements the method 'executeQuery' that handles the necessary logic to invoke the service.
 */
export default class {

    constructor () {
        if (_.isUndefined(this.executeQuery) || !_.isFunction(this.executeQuery)) {
            throw new TypeError('A bridge must implements executeQuery() method')
        }
    }

}