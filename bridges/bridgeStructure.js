'use strict';

import Promise from 'bluebird';

export default class BridgeStructure {
    /**
     * It allows to execute custom queries to web service
     * @param parameterNodes The paramater nodes retrieved from the current context
     * These parameters respect this structure:
     * {
     *    name: the CDT dimension node name
     *    value: the value chosen by the user or acquired by the phone sensors
     * }
     * @returns {bluebird|exports|module.exports} The response provided by the service, in JSON format
     */
    executeQuery (parameterNodes) {
        return new Promise ((resolve, reject) => {
            //add code below
        });
    }
}