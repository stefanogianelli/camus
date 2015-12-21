'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import agent from 'superagent';

import Bridge from './bridge';

export default class RestBridge extends Bridge {

    constructor () {
        super();
        //timeout for the requests (in ms)
        this._timeout = 4000;
    }

    /**
     * Default bridge for rest and query services.
     * It executes the mapping between the service parameters and the values in the CDT.
     * Then compose the query and invoke the service
     * @param service The service description
     * @param paramNodes The parameter nodes of the CDT
     * @returns {Promise|Request|Promise.<T>} The promise with the service response
     */
    executeQuery (service, paramNodes) {
        return this
            ._parameterMapping(service, paramNodes)
            .then(params => {
                return this._invokeService(service, params);
            })
    }

    /**
     * Map the service parameters to the values derived from the CDT
     * @param service The service description
     * @param paramNodes The list of parameter nodes of the CDT
     * @returns {bluebird|exports|module.exports} The mapped parameters
     * These object are composed as follow:
     * {
     *   name: the parameter name
     *   value: the value or the list of values
     * }
     * @private
     */
    _parameterMapping (service, paramNodes) {
        return new Promise((resolve, reject) => {
            let params = [];
            _.forEach(service.operations.parameters, p => {
                if (_.isEmpty(p.mappingCDT)) {
                    //use default value if the parameter is required and no mapping on the CDT was added
                    if (!_.isUndefined(p.default)) {
                        params.push({
                            name: p.name,
                            value: p.default
                        });
                    } else {
                        if (p.required) {
                            //the service cannot be invoked
                            reject('lack of required parameter \'' + p.name + '\'');
                        }
                    }
                } else {
                    //search for the value(s) in the CDT
                    let values = [];
                    let separator = ',';
                    switch (p.collectionFormat) {
                        case 'csv':
                            separator = ',';
                            break;
                        case 'ssv':
                            separator = ' ';
                            break;
                        case 'tsv':
                            separator = '/';
                            break;
                        case 'pipes':
                            separator = '|';
                            break;
                    }
                    _.forEach(p.mappingCDT, m => {
                        let v = this._searchMapping(paramNodes, m);
                        if (!_.isEmpty(v)) {
                            if (_.isEmpty(values)) {
                                values = v;
                            } else {
                                values = values.concat(separator + v);
                            }
                        }
                    });
                    if (!_.isEmpty(values)) {
                        params.push({
                            name: p.name,
                            value: values
                        });
                    } else {
                        if (p.required) {
                            //the service cannot be invoked
                            reject('lack of required parameter \'' + p.name + '\'');
                        }
                    }
                }
            });
            resolve(params);
        });
    }

    /**
     * Search the value of a dimension in the CDT
     * @param nodes The parameter nodes of the CDT
     * @param name The name of the dimension
     * @returns {*} The value found, if exists
     * @private
     */
    _searchMapping (nodes, name) {
        let names = name.split('.');
        let obj = {};
        if (names.length > 0) {
            obj = _.find(nodes, {dimension: names[0]});
        }
        if (!_.isUndefined(obj)) {
            if (names.length > 1) {
                obj = _.find(obj.fields, {name: names[1]});
            }
            return _.result(obj, 'value');
        }
    }

    /**
     * Compose the address of the service, add the header information and call the service.
     * Then return the service response (parsed)
     * @param service The service description
     * @param params The parameters that will be used for query composition
     * @returns {bluebird|exports|module.exports} The parsed response
     * @private
     */
    _invokeService (service, params) {
        return new Promise ((resolve, reject) => {
            const operation = service.operations;
            let request;
            //setting up the query path and parameters
            if (service.protocol === 'rest') {
                let address = service.basePath.concat(operation.path);
                _.forEach(params, p => {
                    address = address.concat('/' + p.name + '/' + p.value);
                });
                request = agent.get(address);
            } else if (service.protocol === 'query') {
                request = agent.get(service.basePath.concat(operation.path));
                _.forEach(params, p => {
                    let obj = {};
                    obj[p.name] = p.value;
                    request.query(obj);
                });
            }
            //adding header information
            _.forEach(operation.headers, h => {
                request.set(h.name, h.value);
            });
            //invoke the service and return the response
            request
                .timeout(this._timeout)
                .end((err, res) => {
                    if (err) {
                        switch (err.status) {
                            case 400:
                                reject('bad request. Check the address and parameters (400)');
                                break;
                            case 401:
                                reject('access to a restricted resource (401)');
                                break;
                            case 404:
                                reject('service not found (404)');
                                break;
                            case 500:
                                reject('server error (500)');
                                break;
                            default:
                                reject(err);
                        }
                    } else {
                        if (!_.isEmpty(res.body)) {
                            resolve(res.body);
                        } else {
                            resolve(JSON.parse(res.text));
                        }
                    }
                });
        });
    }
}