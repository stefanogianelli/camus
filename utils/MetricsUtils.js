'use strict'

import _ from 'lodash'
import fs from 'fs'
import Promise from 'bluebird'

Promise.promisifyAll(fs)

const dir = './metrics'
const path = dir + '/data.json'

let instance = null

/**
 * Helper class for recording execution time of each component
 */
export default class Metrics {

    /**
     * The class constructor
     * @constructor
     */
    constructor () {
        //check if exists the metrics folder
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        //clear the file content
        fs
            .writeFileAsync(path, '')
            .catch((err) => {
                //do nothing
                console.log(err)
            })
        this._results = []
    }

    static getInstance () {
        if (_.isNull(instance)) {
            instance = new Metrics()
        }
        return instance
    }

    /**
     * This function records a value.
     * The times are collected by the label name.
     * @param {String} component - The component name
     * @param {String} label - The label name
     * @param {String} type - The function type (MAIN, FUN, DB, CACHE, EXT)
     * @param {Array} start - The start time acquired by process.hrtime()
     */
    record (component, label, type, start) {
        if (_.isUndefined(component) || _.isUndefined(type) || _.isUndefined(label)) {
            throw new Error('Invalid component, type or label')
        }
        const end = process.hrtime(start)
        const time = end[0] * 1000 + end[1] / 1000000
        this._results.push({
            component: component,
            label: label,
            type: type,
            time: time
        })
    }

    /**
     * This function saves the collected results into the specified file
     */
    saveResults () {
        console.log('[METRICS] Saving results ...')
        fs
            .writeFileAsync(path, JSON.stringify(this._results, 0, 4))
            .then(() => {
                this._results.splice(0,this._results.length)
            })
            .catch((err) => {
                //do nothing
                console.log(err)
            })
    }

}