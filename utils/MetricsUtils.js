'use strict';

import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';

Promise.promisifyAll(fs);

/**
 * Helper class for recording execution time of each component
 */
export default class {

    /**
     * The class constructor. Needs a file path to store the results
     * @param filePath The file path
     */
    constructor (filePath) {
        if (_.isUndefined(filePath) || _.isEmpty(filePath)) {
            throw new Error('File path not set! Please specify a file path');
        }
        this._path = filePath;
        //clear the file content
        fs.writeFileAsync(this._path, '');
        this._map = new Map();
    }

    /**
     * This function records a value.
     * The times are collected by the label name.
     * @param label The label name
     * @param startTime The start time (in ms)
     * @param endTime The end time (in ms)
     */
    record (label, startTime, endTime) {
        if (_.isUndefined(label) || !_.isString(label)) {
            throw new Error('Invalid label');
        }
        if (_.isUndefined(startTime) || !_.isNumber(startTime)) {
            throw new Error('Invalid start time');
        }
        if (_.isUndefined(endTime) || !_.isNumber(endTime)) {
            throw new Error('Invalid end time');
        }
        if (startTime > endTime) {
            throw new Error('The end time must be less or equal than the start time!');
        }
        const time = endTime - startTime;
        if (this._map.has(label)) {
            this._map.get(label).push(time);
        } else {
            this._map.set(label, [time]);
        }
    }

    /**
     * This function saves the collected results into the specified file
     */
    saveResults () {
        let output = '';
        this._map.forEach((item, key) => {
            item.forEach(time => {
                output += key + '\t' + time + '\n';
            })
        });
        this._map.clear();
        fs.appendFileAsync(this._path, output);
    }

}