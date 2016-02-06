'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import agent from 'superagent';
import Redis from 'ioredis';
import config from 'config';

import Bridge from './bridge';
import Metrics from '../utils/MetricsUtils';

//acquire redis configuration
let port = 6379;
if (config.has('redis.port')) {
    port = config.get('redis.port');
}

let address = 'localhost';
if (config.has('redis.address')) {
    address = config.get('redis.address');
}

const redis = new Redis(port, address);

let debug = false;
if (config.has('debug')) {
    debug = config.get('debug');
}

let metrics = null;
if (debug) {
    const filePath = __dirname.replace('bridges', '') + '/metrics/RestBridge.txt';
    metrics = new Metrics(filePath);
}

/**
 * REST Bridge
 */
export default class extends Bridge {

    constructor () {
        super();
        //timeout for the requests (in ms)
        if (config.has('rest.timeout.service')) {
            this._timeout = config.get('rest.timeout.service');
        } else {
            this._timeout = 3000;
        }
        //validity time for cache content (in s)
        if (config.has('rest.timeout.cache')) {
            this._cacheTTL = config.get('rest.timeout.cache');
        } else {
            this._cacheTTL = 3600;
        }
    }

    /**
     * Default bridge for rest and query services.
     * It executes the mapping between the service parameters and the values in the CDT.
     * Then compose the query and invoke the service
     * @param descriptor The service description
     * @param paramNodes The parameter nodes of the CDT
     * @param paginationArgs Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {Promise|Request|Promise.<T>} The promise with the service responses
     */
    executeQuery (descriptor, paramNodes, paginationArgs) {
        const startTime = process.hrtime();
        return this
            ._parameterMapping(descriptor, paramNodes)
            .then(params => {
                return this._invokeService(descriptor, params, paginationArgs);
            })
            .finally(() => {
                if (debug) {
                    metrics.record('executeQuery/' + descriptor.service.name, startTime);
                    metrics.saveResults();
                }
            });
    }

    /**
     * Map the service parameters to the values derived from the CDT
     * @param descriptor The service description
     * @param paramNodes The list of parameter nodes of the CDT
     * @returns {bluebird|exports|module.exports} The mapped parameters
     * These object are composed as follow:
     * {
     *   name: the parameter name
     *   value: the value or the list of values
     * }
     * @private
     */
    _parameterMapping (descriptor, paramNodes) {
        return new Promise((resolve, reject) => {
            let params = [];
            _.forEach(descriptor.parameters, p => {
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
                    let values = '';
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
            obj = _.find(nodes, {name: names[0]});
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
     * @param descriptor The service description
     * @param params The parameters that will be used for query composition
     * @param pagination Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {bluebird|exports|module.exports} The parsed response
     * @private
     */
    _invokeService (descriptor, params, pagination) {
        const start = process.hrtime();
        return new Promise ((resolve, reject) => {
            //configure parameters (the default ones are useful for standard query composition)
            let querySymbols = {
                start: '?',
                assign: '=',
                separator: '&'
            };
            //change parameter value if the service is REST
            if (descriptor.service.protocol === 'rest') {
                querySymbols.start = querySymbols.assign = querySymbols.separator = '/';
            }
            //setting up the query path and parameters
            let address = descriptor.service.basePath + descriptor.path + querySymbols.start;
            let parameters = _.reduce(params, (output, p) => {
                //add the value(s) to the query
                if (_.isEmpty(output)) {
                    return p.name + querySymbols.assign + p.value;
                } else {
                    return output + querySymbols.separator + p.name + querySymbols.assign + p.value;
                }
            }, '');
            //acquire pagination parameters
            let startPage = this._getStartPage(descriptor, pagination);
            //check if next page is defined
            let currentPageAddress = null;
            if (startPage) {
                currentPageAddress = descriptor.pagination.attributeName + querySymbols.assign + startPage;
            }
            //add the address to the request object
            let fullAddress = address + parameters;
            if (currentPageAddress) {
                fullAddress += querySymbols.separator + currentPageAddress;
            }
            if (debug) {
                console.log('Querying service \'' + descriptor.service.name + ': ' + fullAddress);
            }
            this
                ._makeCall(fullAddress, descriptor.headers, descriptor.service.name)
                .then(response => {
                    //acquire next page information
                    let {hasNextPage, nextPage} = this._getPaginationStatus(descriptor, startPage, response);
                    if (debug) {
                        metrics.record('invokeService/' + descriptor.service.name, start);
                    }
                    resolve({
                        status: 'OK',
                        hasNextPage: hasNextPage,
                        nextPage: nextPage,
                        response: response
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * Make a request to the current web service and retrieve the response
     * @param address The service's address
     * @param headers The headers to be appended to the request
     * @param service The service name
     * @returns {Object} The received response
     * @private
     */
    _makeCall (address, headers, service) {
        const start = process.hrtime();
        return new Promise ((resolve, reject) => {
            //check if a copy of the response exists in the cache
            redis
                .get(address)
                .then((result) => {
                    if (debug) {
                        metrics.record('accessCache/' + service, start);
                    }
                    if (result) {
                        //return immediately the cached response
                        return resolve(JSON.parse(result));
                    } else {
                        //send a new request
                        //creating the agent
                        let request = agent.get(address);
                        //adding header information
                        _.forEach(headers, h => {
                            request.set(h.name, h.value);
                        });
                        //setting timeout
                        request.timeout(this._timeout);
                        //invoke the service and return the response
                        request.end((err, res) => {
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
                                let response;
                                if (!_.isEmpty(res.body)) {
                                    response = res.body;
                                } else {
                                    response = JSON.parse(res.text);
                                }
                                //caching the response (with associated TTL)
                                redis.set(address, res.text, 'EX', this._cacheTTL);
                                if (debug) {
                                    metrics.record('makeCall/' + service, start);
                                }
                                return resolve(response);
                            }
                        });
                    }
                });
        });
    }

    /**
     * Check if can be requested a new page from the current service
     * @param descriptor The service description
     * @param currentPage The last page queried
     * @param response The last responses received by the service
     * @returns {{hasNextPage: boolean, nextPage: *}} hasNextPage is a boolean attribute that specify if exists another page to be queried; nextPage define the identifier of the following page, and can be a number or a token depends on the service implementation.
     * @private
     */
    _getPaginationStatus (descriptor, currentPage, response) {
        let hasNextPage = false;
        let nextPage = null;
        //check if the service has pagination parameters associated
        if (_.has(descriptor, 'pagination')) {
            const paginationConfig = descriptor.pagination;
            //acquire the next page identifier
            if (paginationConfig.type === 'number') {
                //initialize the first page
                if (_.isNull(currentPage)) {
                    currentPage = 1;
                }
                //get the pages count
                try {
                    let count = Number(response[paginationConfig.pageCountAttribute]);
                    //check if can I acquire a new page
                    if (currentPage + 1 <= count) {
                        nextPage = currentPage + 1;
                        hasNextPage = true;
                    }
                } catch (e) {
                    console.log('Invalid page count value');
                }
            } else if (paginationConfig.type === 'token') {
                //get the next token
                let nextToken = response[paginationConfig.tokenAttribute];
                //check if the token is valid
                if (!_.isUndefined(nextToken) && !_.isEmpty(nextToken)) {
                    nextPage = nextToken;
                    hasNextPage = true;
                }
            }
        }
        return {
            hasNextPage,
            nextPage
        };
    }

    /**
     * Define the initial status of pagination attributes
     * @param descriptor The service description
     * @param paginationArgs The pagination arguments received by the caller
     * @returns {String} The startPage attribute defines the starting identifier that will be queried
     * @private
     */
    _getStartPage (descriptor, paginationArgs) {
        let startPage = null;
        //check if the service has pagination parameters associated
        if (_.has(descriptor, 'pagination') && !_.isUndefined(paginationArgs)) {
            //check if exists a start page placeholder
            if (!_.isUndefined(paginationArgs.startPage)) {
                startPage = paginationArgs.startPage;
            }
        }
        return startPage;
    }
}