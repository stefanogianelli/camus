var _ = require('lodash');
var Promise = require('bluebird');
var provider = require('../provider/provider.js');

var supportServiceSelection = function () { };

/**
 * Create the list of support services associated to the current context
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of services, with the query associated
 */
supportServiceSelection.prototype.selectServices = function selectServices (decoratedCdt) {
    return new Promise (function (resolve, reject) {
        Promise
            .props({
                //acquire the URLs for the services requested by name and operation
                servicesByName: supportServiceSelection.prototype._selectServicesFromName(decoratedCdt.supportServiceNames),
                //acquire the URLs for the services requested by categories
                serviceByCategory: supportServiceSelection.prototype._selectServiceFromCategory(decoratedCdt.supportServiceCategories, decoratedCdt)
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
supportServiceSelection.prototype._selectServicesFromName = function _selectServicesFromName (serviceNames) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(serviceNames) && !_.isEmpty(serviceNames)) {
            provider
                //retrieve the service descriptions
                .getServicesByNames(serviceNames)
                .then(function (services) {
                    //compose the queries
                    resolve(supportServiceSelection.prototype._composeQueries(services));
                })
                .catch(function (e) {
                    console.log(e);
                    resolve();
                });
        } else {
            resolve();
        }
    });
};

/**
 * Select the services associated to a category
 * @param categories The list of categories
 * @param decoratedCdt The decorated CDT
 * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
 */
supportServiceSelection.prototype._selectServiceFromCategory = function _selectServiceFromCategory (categories, decoratedCdt) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(categories) && !_.isEmpty(categories) && !_.isEmpty(decoratedCdt.filterNodes)) {
            Promise
                .map(categories, function (c) {
                    return provider
                        .filterSupportServices(decoratedCdt._id, c, _.union(decoratedCdt.filterNodes, decoratedCdt.rankingNodes))
                        .then(function (services) {
                            //retrieve the service descriptions for the found operation identifiers
                            return provider.getServicesByOperationIds(_.pluck(services, '_idOperation'));
                        })
                        .then(function (services) {
                            //compose the queries
                            return supportServiceSelection.prototype._composeQueries(services, c);
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
};

/**
 * Compose the queries of the selected services
 * @param services The list of services
 * @param category (optional) The service category
 * @returns {Array} The list of services with the composed queries
 */
supportServiceSelection.prototype._composeQueries = function _composeQueries (services, category) {
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
};

module.exports = new supportServiceSelection();