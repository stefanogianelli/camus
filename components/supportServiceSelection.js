var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');
var pluginManager = require('./pluginManager.js');

var supportServiceSelection = function () { };

/**
 * Create the list of support services associated to the current context
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of services, with the query associated
 */
supportServiceSelection.prototype.selectServices = function (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        Promise
            .props({
                //acquire the URLs for the services requested by name and operation
                servicesByName: selectServicesFromName(decoratedCdt.supportServiceNames),
                //acquire the URLs for the services requested by categories
                serviceByCategory: selectServiceFromCategory(decoratedCdt.supportServiceCategories, decoratedCdt)
            })
            .then(function (result) {
                //return the union of the two lists
                resolve(_.union(result.servicesByName, result.serviceByCategory));
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

/**
 * Compose the queries of services from a list of operation ids
 * @param serviceNames The list of services name and operation
 * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
 */
function selectServicesFromName (serviceNames) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(serviceNames) && !_.isEmpty(serviceNames)) {
            provider
                //retrieve the service descriptions
                .getServicesByNames(serviceNames)
                .then(function (services) {
                    //compose the queries
                    resolve(composeQueries(services));
                })
                .catch(function (e) {
                    console.log(e);
                    resolve();
                });
        } else {
            resolve();
        }
    });
}

/**
 * Select the services associated to a category
 * @param categories The list of categories
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
 */
function selectServiceFromCategory (categories, decoratedCdt) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(categories) && !_.isEmpty(categories) && !_.isEmpty(decoratedCdt.filterNodes)) {
            Promise
                .map(categories, function (c) {
                    return provider
                        .filterSupportServices(decoratedCdt._id, c, _.union(decoratedCdt.filterNodes, decoratedCdt.rankingNodes))
                        .then(function (services) {
                            //execute the custom plugins for a subset of nodes
                            return [services, loadSearchPlugins(decoratedCdt._id, _.union(decoratedCdt.specificFilterNodes, decoratedCdt.specificRankingNodes), c)];
                        })
                        .spread(function (filterServices, customServices) {
                            //retrieve the service descriptions for the found operation identifiers
                            return provider
                                .getServicesByOperationIds(mergeResults(filterServices, customServices));
                        })
                        .then(function (services) {
                            //compose the queries
                            return composeQueries(services, c);
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                })
                .then(function (output) {
                    resolve(_.flatten(output));
                });
        } else {
            resolve();
        }
    });
}

/**
 * Search for the CDT nodes that need a specific search function and execute it
 * @param idCDT The CDT identifier
 * @param specificNodes The specific nodes defined in the decorated CDT
 * @param category The support service category
 * @returns {bluebird|exports|module.exports} The promise with the services found
 */
function loadSearchPlugins (idCDT, specificNodes, category) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(specificNodes)) {
            //retrieve the association data for the dimensions
            provider
                .filterSupportServices(idCDT, category, specificNodes, true)
                .then(function (data) {
                    //call the function that takes care to execute the search functions
                    return pluginManager.executeModules(specificNodes, data);
                })
                .then(function (results) {
                    //return the services found
                    resolve(results);
                })
                .catch(function (e) {
                    reject(e);
                });
        } else {
            resolve();
        }
    });
}

/**
 * Create the final list of support services selected for a specific category
 * @param filterServices The services found by the standard search
 * @param customServices The services found by the custom searches
 * @returns {Array} The operation identifiers of the selected support services
 */
function mergeResults (filterServices, customServices) {
    var results = [];
    _.forEach(_.union(filterServices, customServices), function (s) {
        //search if the current operation already exists in the results collection
        var index = _.findIndex(results, function (i) {
            return i._idOperation.equals(s._idOperation);
        });
        if (index === -1) {
            //operation not found, so I create a new object
            results.push({
                _idOperation: s._idOperation,
                constraintCount: s.constraintCount,
                count: 1
            });
        } else {
            //operation found, so I increase the counter
            results[index].count += 1
        }
    });
    //get the maximum value of the count attribute
    var maxCount = _.max(_.pluck(results, 'count'));
    //filter out the operations with the maximum count value and that respect their total constraint counter
    results = _.filter(results, function (r) {
        return r.count === maxCount && r.constraintCount === r.count;
    });
    return _.pluck(results, '_idOperation');
}

/**
 * Compose the queries of the selected services
 * @param services The list of services
 * @param category (optional) The service category
 * @returns {Array} The list of services with the composed queries
 */
function composeQueries (services, category) {
    return _.map(services, function (s) {
        //configure parameters (the default ones are useful for standard query composition)
        var start = '?';
        var assign = '=';
        var separator = '&';
        //change parameter value if the service is REST
        if (s.protocol === 'rest') {
            start = assign = separator = '/';
        }
        //add the base path and the operation path to the address
        var address = s.basePath + s.operations[0].path + start;
        //compose the parameters part of the query
        var output = _.reduce(s.operations[0].parameters, function (output, p) {
            var values;
            if (_.isEmpty(p.mappingTerm)) {
                //if no term is associated use the default value
                values = p.default;
            } else {
                // compose the values part of the parameter
                var valueSeparator = ',';
                //select the correct separator (the default one is the comma)
                switch (p.collectionFormat) {
                    case 'csv':
                        valueSeparator = ',';
                        break;
                    case 'ssv':
                        valueSeparator = ' ';
                        break;
                    case 'tsv':
                        valueSeparator = '/';
                        break;
                    case 'pipes':
                        valueSeparator = '|';
                        break;
                }
                //concatenate one or more terms, separated by the symbol selected above
                values = _.reduce(p.mappingTerm, function (values, m) {
                    if (_.isEmpty(values)) {
                        return m;
                    } else {
                        return values + valueSeparator + m;
                    }
                }, '');
                values = '{' + values + '}';
            }
            //add the value(s) to the query
            if (_.isEmpty(output)) {
                return p.name + assign + values;
            } else {
                return output + separator + p.name + assign + values;
            }
        }, '');
        //return the object
        if (!_.isUndefined(category) && !_.isEmpty(category)) {
            return {
                category: category,
                service: s.name,
                url: address + output
            };
        } else {
            return {
                name: s.name,
                url: address + output
            };
        }
    });
}

module.exports = new supportServiceSelection();