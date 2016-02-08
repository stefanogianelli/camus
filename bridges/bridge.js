'use strict'

import _ from 'lodash'

/**
 * Bridge
 */
export default class {

    constructor () {
        if (_.isUndefined(this.executeQuery) || !_.isFunction(this.executeQuery)) {
            throw new TypeError('A bridge must implements executeQuery() method')
        }
    }

}