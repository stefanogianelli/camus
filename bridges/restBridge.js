'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import agent from 'superagent';
import async from 'async';
import Redis from 'ioredis';

import Bridge from './bridge';

let redis = new Redis(6379, 'localhost');

/**
 * REST Bridge
 */
export default class extends Bridge {

    constructor () {
        super();
        //timeout for the requests (in ms)
        this._timeout = 4000;
        //validity time for cache content (in s)
        this._cacheTTL = 20;
    }

    /**
     * Default bridge for rest and query services.
     * It executes the mapping between the service parameters and the values in the CDT.
     * Then compose the query and invoke the service
     * @param service The service description
     * @param paramNodes The parameter nodes of the CDT
     * @param paginationArgs Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {Promise|Request|Promise.<T>} The promise with the service responses
     */
    executeQuery (service, paramNodes, paginationArgs) {
        const startTime = Date.now();
        return this
            ._parameterMapping(service, paramNodes)
            .then(params => {
                return this._invokeService(service, params, paginationArgs);
            })
            .finally(() => {
                const endTime = Date.now();
                console.log('Querying service \'' + service.name + '\' took ' + (endTime - startTime) + ' ms');
            });
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
                    let values;
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
     * @param pagination Define the starting point for pagination and how many pages retrieve, if they are available
     * @returns {bluebird|exports|module.exports} The parsed response
     * @private
     */
    _invokeService (service, params, pagination) {
        return new Promise ((resolve, reject) => {
            const operation = service.operations;
            //configure parameters (the default ones are useful for standard query composition)
            let querySymbols = {
                start: '?',
                assign: '=',
                separator: '&'
            };
            //change parameter value if the service is REST
            if (service.protocol === 'rest') {
                querySymbols.start = querySymbols.assign = querySymbols.separator = '/';
            }
            //setting up the query path and parameters
            let address = service.basePath + operation.path + querySymbols.start;
            let parameters = _.reduce(params, (output, p) => {
                //add the value(s) to the query
                if (_.isEmpty(output)) {
                    return p.name + querySymbols.assign + p.value;
                } else {
                    return output + querySymbols.separator + p.name + querySymbols.assign + p.value;
                }
            }, '');
            //acquire pagination parameters
            let {startPage, numOfPages} = this._getPaginationInitialConfig(service, pagination);
            let count = 0;
            let hasNextPage = false;
            let currentPageAddress = null;
            let currentPageIdentifier = startPage;
            let paginationStatus = {};
            let responses = [];
            async.doWhilst(
                (callback) => {
                    //check if next page is defined
                    if (!_.isNull(currentPageIdentifier) && _.has(operation, 'pagination')) {
                        currentPageAddress = operation.pagination.attributeName + querySymbols.assign + currentPageIdentifier;
                    }
                    //add the address to the request object
                    let fullAddress = '';
                    if (!_.isNull(currentPageAddress)) {
                        fullAddress = address + parameters + querySymbols.separator + currentPageAddress;
                    } else {
                        fullAddress = address + parameters;
                    }
                    console.log('Querying service \'' + service.name + '\' #' + (count + 1) + ': ' + fullAddress);
                    //creating the agent
                    let request = agent.get(fullAddress);
                    //adding header information
                    _.forEach(operation.headers, h => {
                        request.set(h.name, h.value);
                    });
                    let callPromise = null;
                    //configure timeout between following requests, if needed
                    if (count > 0) {
                        console.log('Delaying request by: ' + operation.pagination.delay + ' ms');
                        callPromise = Promise
                            .delay(operation.pagination.delay)
                            .then(() => {
                                return this._makeCall(request, fullAddress)
                            });
                    } else {
                        callPromise = this._makeCall(request, fullAddress);
                    }
                    //invoke the service and wait for the response, then acquire information for querying the next page
                    callPromise
                        .then(response => {
                            //collect the response
                            responses.push(response);
                            //acquire next page information
                            paginationStatus = this._getPaginationStatus(service, currentPageIdentifier, response);
                            hasNextPage = paginationStatus.hasNextPage;
                            currentPageIdentifier = paginationStatus.nextPage;
                            count++;
                            callback(null);
                        })
                        .catch(e => {
                            callback(e);
                        });
                },
                () => count < numOfPages && hasNextPage,
                (err) => {
                    if (err) {
                        //if some responses are correctly retrieved I mask the error
                        if (responses.length > 0) {
                            resolve(responses);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(responses);
                    }
                }
            );
        });
    }

    /**
     * Make a request to the current web service and retrieve the response
     * @param request The request object, already initialized
     * @param address The service's address
     * @returns {Object} The received response
     * @private
     */
    _makeCall (request, address) {
        return new Promise ((resolve, reject) => {
            //check if a copy of the response exists in the cache
            redis
                .get(address)
                .then((result) => {
                    if (result) {
                        console.log('Using cached response');
                        return resolve(JSON.parse(result));
                    } else {
                        console.log('Send new request ...');
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
                                    let response;
                                    if (!_.isEmpty(res.body)) {
                                        response = res.body;
                                    } else {
                                        response = JSON.parse(res.text);
                                    }
                                    //caching the response
                                    redis.set(address, res.text, 'EX', this._cacheTTL);
                                    return resolve(response);
                                }
                            });
                    }
                });
        });
    }

    /**
     * Check if can be requested a new page from the current service
     * @param service The service description
     * @param currentPage The last page queried
     * @param response The last responses received by the service
     * @returns {{hasNextPage: boolean, nextPage: *}} hasNextPage is a boolean attribute that specify if exists another page to be queried; nextPage define the identifier of the following page, and can be a number or a token depends on the service implementation.
     * @private
     */
    _getPaginationStatus (service, currentPage, response) {
        let hasNextPage = false;
        let nextPage = null;
        //check if the service has pagination parameters associated
        if (_.has(service.operations, 'pagination')) {
            const paginationConfig = service.operations.pagination;
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
     * @param service The service description
     * @param paginationArgs The pagination arguments received by the caller
     * @returns {{startPage: *, numOfPages: number}} The startPage attribute defines the starting identifier that will be queried; the numOfPages attribute defines the number of pages to be queried.
     * @private
     */
    _getPaginationInitialConfig (service, paginationArgs) {
        let startPage = null;
        let numOfPages = 1;
        //check if the service has pagination parameters associated
        if (_.has(service.operations, 'pagination') && !_.isUndefined(paginationArgs)) {
            //check if exists a start page placeholder
            if (!_.isUndefined(paginationArgs.startPage)) {
                startPage = paginationArgs.startPage;
            }
            //acquire the number of pages to be queried
            if (!_.isUndefined(paginationArgs.numOfPages) && _.isNumber(paginationArgs.numOfPages)) {
                numOfPages = paginationArgs.numOfPages;
            }
        }
        return {
            startPage,
            numOfPages
        };
    }
}