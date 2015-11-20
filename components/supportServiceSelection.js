var _ = require('lodash');
var Promise = require('bluebird');
var contextManager = require('./contextManager.js');
var ServiceModel = require('../models/serviceDescription.js');

Promise.promisifyAll(ServiceModel);

var supportServiceSelection = function () { };

supportServiceSelection.prototype.selectServices = function (context) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(context) && !_.isNull(context)) {
            var promises = [];
            var serviceNames = [];
            var serviceCategories = [];
            var response = [];
            //acquire support services names
            promises.push(
                contextManager
                    .getSupportServiceNames(context)
                    .then(function (names) {
                        serviceNames = names;
                    })
            );
            //acquire the support service categories
            promises.push(
                contextManager
                    .getSupportServiceCategories(context)
                    .then(function (categories) {
                        serviceCategories = categories;
                    })
            );
            Promise
                .all(promises)
                .then(function () {
                    return selectServicesFromName(serviceNames);
                })
                .then(function (services) {
                    response.push(services);
                    return selectServiceFromCategory(serviceCategories, context);
                })
                .then(function (services) {
                    response.push(services);
                    resolve(_.flatten(response));
                })
                .catch(function (e) {
                    console.log(e);
                });
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Compose the query of services from a list of operation ids
 * @param idOperations The list of operation ids
 * @returns {bluebird|exports|module.exports} The list of service object, composed by the service name and the query associated
 */
function selectServicesFromName (idOperations) {
    return new Promise (function (resolve, reject) {
        ServiceModel
            .findByOperationIdsAsync(idOperations)
            .then(function (services) {
                //compose the queries of each service
                var serviceNamesResponse = [];
                _.forEach(services, function (s) {
                    var address = s.basePath + s.operations[0].path;
                    _.forEach(s.operations[0].parameters, function (p, index) {
                        if (index === 0) {
                            address += '?';
                        } else {
                            address += '&';
                        }
                        if (_.isEmpty(p.mappingTerm)) {
                            //use default value
                            address += p.name + '=' + p.default;
                        } else {
                            //associate a placeholder to the term value
                            address += p.name + '={';
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
                            _.forEach(p.mappingTerm, function (m) {
                                if (_.isEmpty(values)) {
                                    values = m;
                                } else {
                                    values = values.concat(separator + m);
                                }
                            });
                            address += values + '}';
                        }
                    });
                    serviceNamesResponse.push({
                        name: s.name,
                        url: address
                    });
                });
                resolve(serviceNamesResponse);
            })
            .catch(function (e) {
                reject(e);
            });
    });
}

function selectServiceFromCategory (categories, context) {
    return new Promise (function (resolve, reject) {
        resolve();
    });
}

module.exports = new supportServiceSelection();