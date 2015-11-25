var _ = require('lodash');
var mongoose = require('mongoose');
var Promise = require('bluebird');

//load the models
var cdtModel = require('../models/cdtDescription.js');
var serviceModel = require('../models/serviceDescription.js');
var primaryServiceModel = require('../models/primaryServiceAssociation.js');
var supportServiceModel = require('../models/supportServiceAssociation.js');

//promisify the models
Promise.promisifyAll(cdtModel);
Promise.promisifyAll(serviceModel);
Promise.promisifyAll(primaryServiceModel);
Promise.promisifyAll(supportServiceModel);

/**
 * Module constructor
 */
var provider = function () {
    mongoose.connection.on('error', function (err) {
        console.log('Mongoose default connection error: ' + err);
    });
};

/**
 * Create a connection to MongoDB
 * @param url The database url
 */
provider.prototype.createConnection = function createConnection (url) {
    if (!_.isUndefined(url)) {
        mongoose.connect(url);
    } else {
        throw Error('No dabatase URL specified');
    }
};

/**
 * Close the connection with MongoDB
 */
provider.prototype.closeConnection = function closeConnection () {
    mongoose.connection.close();
};

/**
 * -------------------------------------
 * CDT METHODS
 * -------------------------------------
 */

/**
 * Retrieve the CDT schema associated to the current identifier
 * @param idCDT The CDT identifier
 * @returns {*} Returns the CDT schema
 */
provider.prototype.getCdt = function getCdt (idCDT) {
    return cdtModel.findAsync({_id: idCDT});
};

/**
 * Find the correct CDT and returns only the specified dimensions
 * @param idCDT The CDT identifier
 * @param dimensions The interested dimensions
 * @returns {*} The CDT with selected dimensions
 */
provider.prototype.getCdtDimensions = function getCdtDimensions (idCDT, dimensions) {
    return cdtModel
        .aggregateAsync(
            {$match: {_id: idCDT}},
            {$unwind: '$context'},
            {$match: {'context.name': {$in: dimensions}}},
            {$group: {
                _id: '$_id',
                context: {
                    $push: {
                        dimension: '$context.name',
                        for: '$context.for',
                        transformFunction: '$context.transformFunction',
                        supportCategory: '$context.supportCategory',
                        params: '$context.params'
                    }
                }
            }}
        );
};

/**
 * Create the list of descendant nodes of the node(s) specified
 * @param idCDT The CDT identifier
 * @param nodes The node or the list of nodes
 * @returns {*} The list of sons
 */
provider.prototype.getNodeDescendants = function getNodeDescendants (idCDT, nodes) {
    var whereClause = {};
    var projectClause = {};
    if (_.isArray(nodes)) {
        var values = _.pluck(nodes, 'value');
        whereClause = {
            _id: idCDT,
            'context.parents': {
                $in: values
            }
        };
        projectClause = {
            context: {
                $elemMatch: {
                    parents: {
                        $in: values
                    }
                }
            }
        }
    } else {
        whereClause = {
            _id: idCDT,
            'context.parents': nodes.value
        };
        projectClause = {
            context: {
                $elemMatch: {
                    parents: nodes.value
                }
            }
        }
    }
    return cdtModel.findAsync(whereClause, projectClause)
};

/**
 * -------------------------------------
 * SERVICE DESCRIPTION METHODS
 * -------------------------------------
 */

/**
 * Retrieve the service description for the requested operation.
 * This schema contains only the requested operation.
 * @param idOperation The operation identifier
 * @returns {*} Returns the service and operation schema
 */
provider.prototype.getServiceByOperationId = function getServiceOperation (idOperation) {
    return serviceModel.findByOperationIdAsync(idOperation);
};

/**
 * Retrieve the service descriptions for the requested operations.
 * This schema contains only the requested operations.
 * @param idOperations The list of operation identifiers
 * @returns {*} Returns the service list with only the requested operations
 */
provider.prototype.getServicesByOperationIds = function getServiceOperation (idOperations) {
    return serviceModel.findByOperationIdsAsync(idOperations);
};

/**
 * Retrieve a service description by it's name and operation name.
 * @param serviceNames The object containing the service and operation names.
 * This object must be in form { name: 'service name', operation: 'operation name' }
 * @returns {*} The service and operation description
 */
provider.prototype.getServicesByNames = function getServicesByNames (serviceNames) {
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
        return serviceModel.findAsync(whereClause);
    }
};

/**
 * -------------------------------------
 * PRIMARY SERVICE ASSOCIATION METHODS
 * -------------------------------------
 */

/**
 * Search the services that are associated to the specified attributes.
 * These attributes must have this format:
 * { dimension: 'dimension name', value: 'associated value' }
 * @param attributes The list of filter nodes selected
 * @param idCDT The CDT identifier
 * @param onlyDimensions (optional) If it's true it consider only the dimensions name (default false)
 * @returns {*} The list of operation id, with ranking and weight, of the found services
 */
provider.prototype.filterPrimaryServices = function filterPrimaryServices (attributes, idCDT, onlyDimensions) {
    if (_.isUndefined(onlyDimensions)) {
        onlyDimensions = false;
    }
    if (!_.isEmpty(attributes)) {
        var whereClause = {
            _idCDT: idCDT,
            $or: []
        };
        _.forEach(attributes, function (n) {
            if (onlyDimensions) {
                whereClause.$or.push({
                    dimension: n.dimension
                });
            } else {
                whereClause.$or.push({
                    $and: [n]
                });
            }
        });
        if (onlyDimensions) {
            return primaryServiceModel.findAsync(whereClause, {_idCDT: 0, _id: 0, __v: 0});
        } else {
            return primaryServiceModel.findAsync(whereClause, {_idOperation: 1, ranking: 1, weight: 1, _id: 0});
        }
    } else {
        throw Error('No filter nodes selected!');
    }
};

/**
 * -------------------------------------
 * SUPPORT SERVICE ASSOCIATION METHODS
 * -------------------------------------
 */

/**
 * Search the support services associated to specific attributes
 * @param idCDT The CDT identifier
 * @param category The service category
 * @param attributes The list of attributes
 * @param withRequire (optional) If true selects all the associations with a require. By default it's false
 * @returns {*} The list of services found
 */
provider.prototype.filterSupportServices = function filterSupportServices (idCDT, category, attributes, withRequire) {
    var whereClause;
    if(_.isUndefined(withRequire)) {
        withRequire = false;
    }
    if (withRequire) {
        whereClause = {
            _idCDT: idCDT,
            category: category,
            $or: [],
            require: {
                $ne: null
            }
        };
    } else {
        whereClause = {
            _idCDT: idCDT,
            category: category,
            $or: [],
            require: {
                $eq: null
            }
        };
    }
    if (_.isArray(attributes)) {
        _.forEach(attributes, function (n) {
            whereClause.$or.push({
                dimension: n.dimension,
                value: n.value
            });
        });
    } else {
        whereClause.$or.push({
            dimension: attributes.dimension,
            value: attributes.value
        });
    }
    return supportServiceModel.findAsync(whereClause);
};

module.exports = new provider();