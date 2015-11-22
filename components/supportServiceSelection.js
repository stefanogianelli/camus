var _ = require('lodash');
var Promise = require('bluebird');
var contextManager = require('./contextManager.js');
var ServiceModel = require('../models/serviceDescription.js');
var serviceAssociation = require('../models/supportServiceAssociation.js');

Promise.promisifyAll(ServiceModel);
Promise.promisifyAll(serviceAssociation);

var supportServiceSelection = function () { };

/**
 * Create the list of support services associated to the current context
 * @param context The current context
 * @returns {bluebird|exports|module.exports} The list of services, with the query associated
 */
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
                    if (!_.isUndefined(services) && !_.isEmpty(services)) {
                        response = response.concat(services);
                    }
                    return selectServiceFromCategory(serviceCategories, context);
                })
                .then(function (services) {
                    if (!_.isUndefined(services) && !_.isEmpty(services)) {
                        response = response.concat(services);
                    }
                    resolve(response);
                })
                .catch(function (e) {
                    reject(e);
                });
        } else {
            reject('No context selected');
        }
    });
};

/**
 * Compose the query of services from a list of operation ids
 * @param serviceNames The list of services name and operation
 * @returns {bluebird|exports|module.exports} The list of service object, composed by the service name and the query associated
 */
function selectServicesFromName (serviceNames) {
    return new Promise (function (resolve, reject) {
        if (!_.isUndefined(serviceNames) && !_.isEmpty(serviceNames)) {
            var whereClause = {
                $or: []
            };
            _.forEach(serviceNames, function (s) {
                whereClause.$or.push({
                    $and: [{
                        name: s.name,
                        'operations.name': s.operation
                    }]
                });
            });
            ServiceModel
                .findAsync(whereClause)
                .then(function (services) {
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
 * @returns {bluebird|exports|module.exports} The list of service object, composed by the service name and the query associated
 */
function selectServiceFromCategory (categories, context) {
    return new Promise (function (resolve, reject) {
        var output = [];
        Promise
            .map(categories, function (c) {
                return Promise
                    .props({
                        noConstraintServices: getNoConstraintServices(c, context),
                        baseServices: getBaseServices(c, context),
                        filterServices: getFilterServices(c, context)
                    })
                    .then(function (result) {
                        var response = [];
                        if (!_.isUndefined(result.baseServices) && !_.isEmpty(result.baseServices) &&
                                !_.isUndefined(result.filterServices) && !_.isEmpty(result.filterServices)) {
                            response = intersect(result.baseServices, result.filterServices);
                        }
                        if (!_.isUndefined(result.noConstraintServices) && !_.isEmpty(result.noConstraintServices)) {
                            response = response.concat(result.noConstraintServices);
                        }
                        return ServiceModel
                            .findByOperationIdsAsync(response);
                    })
                    .then(function (services) {
                        output = output.concat(composeQuery(services, c));
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            })
            .then(function () {
                resolve(output);
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
        var selectedServices = [];
        var whereClause = {
            _idCDT: context._id,
            category: category,
            $or: [],
            require: {
                $eq: null
            }
        };
        contextManager
            .getSupportServicePrimaryDimension(category, context)
            .then(function (node) {
                whereClause.$or.push({
                    dimension: node.dimension,
                    value: node.value
                });
                //get the son node
                return contextManager
                    .getDescendants(context._id, node);
            })
            .then(function (nodes) {
                if (!_.isUndefined(nodes) && !_.isEmpty(nodes)) {
                    whereClause.$or = _.union(whereClause.$or, nodes);
                }
                return serviceAssociation
                    .findAsync(whereClause);
            })
            .then(function (services) {
                _.forEach(services, function (s) {
                    if(_.indexOf(selectedServices, s._idOperation) === -1) {
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
        var baseServices = [];
        var whereClause = {
            _idCDT: context._id,
            category: category,
            $or: [],
            require: {
                $ne: null
            }
        };
        contextManager
            .getSupportServicePrimaryDimension(category, context)
            .then(function (node) {
                whereClause.$or.push({
                    dimension: node.dimension,
                    value: node.value
                });
                //get the son node
                return contextManager
                    .getDescendants(context._id, node);
            })
            .then(function (nodes) {
                whereClause.$or = _.union(whereClause.$or, nodes);
                return serviceAssociation
                    .findAsync(whereClause);
            })
            .then(function (services) {
                _.forEach(services, function (s) {
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
        var filterServices = [];
        var whereClause = {
            _idCDT: context._id,
            category: category,
            $or: []
        };
        contextManager
            .getFilterNodes(context)
            .then(function (nodes) {
                _.forEach(nodes, function (n) {
                    whereClause.$or.push({
                        dimension: n.dimension,
                        value: n.value
                    });
                });
                //get the son node
                return contextManager
                    .getDescendants(context._id, nodes);
            })
            .then(function (nodes) {
                whereClause.$or = _.union(whereClause.$or, nodes);
                return serviceAssociation
                    .findAsync(whereClause);
            })
            .then(function (services) {
                _.forEach(services, function (s) {
                    if (!_.isEmpty(s.require)) {
                        if(contextManager.isDefined(s.require, context)) {
                            if(!exists(filterServices, s)) {
                                filterServices.push(s._idOperation);
                            }
                        }
                    } else {
                        if(_.indexOf(filterServices, s._idOperation) === -1) {
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

/**
 * Compose the queries of the selected services
 * @param services The list of services
 * @param category (optional) The service category
 * @returns {Array} The list of services with the composed queries
 */
function composeQuery (services, category) {
    var serviceQueries = [];
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
        if (!_.isUndefined(category) && !_.isEmpty(category)) {
            serviceQueries.push({
                category: category,
                service: s.name,
                url: address
            });
        } else {
            serviceQueries.push({
                name: s.name,
                url: address
            });
        }
    });
    return serviceQueries;
}

module.exports = new supportServiceSelection();