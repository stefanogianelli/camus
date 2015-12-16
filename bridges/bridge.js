'use strict';

import _ from 'lodash';

export default class Bridge {

    constructor () {
        if (_.isUndefined(this.executeQuery) || !_.isFunction(this.executeQuery)) {
            throw new TypeError('A bridge must implements executeQuery() method');
        }
    }

}