var _ = require('lodash');
var Promise = require('bluebird');
var agent = require('superagent');

var restBridge = function () { };

/**
 * Default bridge for rest and query services.
 * It executes the mapping between the service parameters and the values in the CDT.
 * Then compose the query and invoke the service
 * @param service The service description
 * @param paramNodes The parameter nodes of the CDT
 * @returns {*|{get}} The promise with the service response
 */
restBridge.prototype.executeQuery = function (service, paramNodes) {
    return new Promise(function (resolve, reject) {
        parameterMapping(service, paramNodes)
            .then(function (params) {
                return invokeService(service, params);
            })
            .then(function (response) {
                resolve(response);
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

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
 */
function parameterMapping (service, paramNodes) {
    return new Promise(function (resolve, reject) {
        var params = [];
        _.forEach(service.operations[0].parameters, function (p) {
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
                var values;
                var separator = ',';
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
                _.forEach(p.mappingCDT, function (m) {
                    var v = searchMapping(paramNodes, m);
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
 */
function searchMapping (nodes, name) {
    return _.result(_.find(nodes, {dimension: name}), 'value');
}

/**
 * Compose the address of the service, add the header information and call the service.
 * Then return the service response (parsed)
 * @param service The service description
 * @param params The parameters that will be used for query composition
 * @returns {bluebird|exports|module.exports} The parsed response
 */
function invokeService (service, params) {
    return new Promise (function (resolve, reject) {
        var request;
        //setting up the query path and parameters
        if (service.protocol === 'rest') {
            var address = service.basePath.concat(service.operations[0].path);
            _.forEach(params, function (p) {
                address = address.concat('/' + p.name + '/' + p.value);
            });
            request = agent.get(address);
        } else if (service.protocol === 'query') {
            request = agent.get(service.basePath.concat(service.operations[0].path));
            _.forEach(params, function (p) {
                var obj = {};
                obj[p.name] = p.value;
                request.query(obj);
            });
        }
        //adding header information
        _.forEach(service.operations[0].headers, function (h) {
            request.set(h.name, h.value);
        });
        //invoke the service and return the response
        request
            .end(function (err, res) {
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

module.exports = new restBridge();