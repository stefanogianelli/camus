var _ = require('lodash');
var Promise = require('bluebird');
var contextManager = require('./contextManager.js');
var provider = require('../provider/provider.js');

var supportServiceSelection = function () { };

/**
 * Create the list of support services associated to the current context
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of services, with the query associated
 */
supportServiceSelection.prototype.selectServices = function (context) {
    return new Promise (function (resolve, reject) {
        Promise
            .props({
                //acquire the URLs for the services requested by name and operation
                servicesByName: contextManager
                    //obtain the names of the services
                    .getSupportServiceNames(context)
                    .then(function (serviceNames) {
                        //compose the URL for the services found
                        return selectServicesFromName(serviceNames);
                    }),
                //acquire the URLs for the services requested by categories
                serviceByCategory: contextManager
                    //obtain the categories requested in the context
                    .getSupportServiceCategories(context)
                    .then(function (serviceCategories) {
                        //compose the URL for the services found
                        return selectServiceFromCategory(serviceCategories, context);
                    })
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
                    resolve(composeQuery(services));
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
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
 */
function selectServiceFromCategory (categories, context) {
    return new Promise (function (resolve, reject) {
        Promise
            .map(categories, function (c) {
                return Promise
                    .props({
                        //retrieve the services that haven't a constraint defined
                        noConstraintServices: getNoConstraintServices(c, context),
                        //retrieve the services from the primary dimension for the current category
                        baseServices: getBaseServices(c, context),
                        //retrieve the services with constraints
                        filterServices: getFilterServices(c, context)
                    })
                    .then(function (result) {
                        //the interested services are the intersection between the base services and the filter services plus the unconstrained
                        return provider
                            .getServicesByOperationIds(_.union(result.noConstraintServices, intersect(result.baseServices, result.filterServices)));
                    })
                    .then(function (services) {
                        //compose the queries
                        return composeQuery(services, c);
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            })
            .then(function (output) {
                resolve(_.flatten(output));
            });
    });
}

/**
 * Retrieve the support services associated to the primary dimension of the current category, that not expose any constraint
 * @param category The current service category
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of services retrieved
 */
function getNoConstraintServices (category, context) {
    return new Promise(function (resolve, reject) {
        contextManager
            //get the node associated to the primary dimension for the current category
            .getSupportServicePrimaryDimension(category, context)
            .then(function (node) {
                //get the son node
                return [node, contextManager.getDescendants(context._id, node)];
            })
            .spread(function (baseNode, nodes) {
                //search the services without constraints associated to the nodes
                return provider
                    .filterSupportServices(context._id, category, _(nodes).concat(_.pick(baseNode, ['dimension', 'value'])).value());
            })
            .then(function (services) {
                var selectedServices = [];
                _.forEach(services, function (s) {
                    if(!exists(selectedServices, s)) {
                        selectedServices.push(s._idOperation);
                    }
                });
                resolve(selectedServices);
            })
            .catch(function (e) {
                console.log(e);
                resolve();
            });
    });
}

/**
 * Retrieve the support services associated to the primary dimension of the current category, that have a dimension constraint
 * @param category The current service category
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of services retrieved
 */
function getBaseServices (category, context) {
    return new Promise(function (resolve, reject) {
        contextManager
            //get the node associated to the primary dimension for the current category
            .getSupportServicePrimaryDimension(category, context)
            .then(function (node) {
                //get the son node
                return [node, contextManager.getDescendants(context._id, node)];
            })
            .spread(function (baseNode, nodes) {
                //search the services with constraints associated to the nodes
                return provider
                    .filterSupportServices(context._id, category, _(nodes).concat(_.pick(baseNode, ['dimension', 'value'])).value(), true);
            })
            .then(function (services) {
                var baseServices = [];
                _.forEach(services, function (s) {
                    //check if the required dimension is defined in the context
                    if(contextManager.isDefined(s.require, context)) {
                        if (!exists(baseServices, s)) {
                            baseServices.push(s._idOperation);
                        }
                    }
                });
                resolve(baseServices);
            })
            .catch(function (e) {
                console.log(e);
                resolve();
            });
    });
}

/**
 * Retrieve the support services associated to the filter dimensions of the current category
 * @param category The current service category
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of services retrieved
 */
function getFilterServices (category, context) {
    return new Promise(function (resolve, reject) {
        contextManager
            //get the filter nodes defined in the context
            .getFilterNodes(context)
            .then(function (nodes) {
                //get the son node
                return [nodes, contextManager.getDescendants(context._id, nodes)];
            })
            .spread(function (baseNodes, nodes) {
                //search the services associated to the nodes
                return provider.filterSupportServices(context._id, category, _.union(baseNodes, nodes));
            })
            .then(function (services) {
                var filterServices = [];
                _.forEach(services, function (s) {
                    if (!_.isEmpty(s.require)) {
                        //if the service exposes a constraint, check if it respected
                        if(contextManager.isDefined(s.require, context)) {
                            if(!exists(filterServices, s)) {
                                filterServices.push(s._idOperation);
                            }
                        }
                    } else {
                        if(!exists(filterServices, s)) {
                            filterServices.push(s._idOperation);
                        }
                    }
                });
                resolve(filterServices);
            })
            .catch(function (e) {
                console.log(e);
                resolve();
            });
    });
}

/**
 * Find if an ObjectId is already in the array
 * @param array The array where search
 * @param item The item to be searched
 */
function exists (array, item) {
    var index = _.findIndex(array, function (i) {
        return i.equals(item._idOperation);
    });
    return index !== -1;
}

/**
 * Return the intersection of two arrays
 * @param array1 The first array
 * @param array2 The second array
 * @returns {Array} The array intersection of the input ones
 */
function intersect (array1, array2) {
    var first, second;
    if (!_.isUndefined(array1) && !_.isUndefined(array2)) {
        if (array1.length < array2.length) {
            first = array1;
            second = array2;
        } else {
            first = array2;
            second = array1;
        }
        return _.filter(first, function (i) {
            var index = _.findIndex(second, function (s) {
                return s.equals(i);
            });
            return index !== -1;
        });
    }
}

/**
 * Compose the queries of the selected services
 * @param services The list of services
 * @param category (optional) The service category
 * @returns {Array} The list of services with the composed queries
 */
function composeQuery (services, category) {
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