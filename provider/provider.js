'use strict';

import _ from 'lodash';
import mongoose from 'mongoose';
import Promise from 'bluebird';

//load the models
import cdtModel from '../models/mongoose/cdtDescription';
import serviceModel from '../models/mongoose/serviceDescription';
import primaryServiceModel from '../models/mongoose/primaryServiceAssociation';
import supportServiceModel from '../models/mongoose/supportServiceAssociation';

//promisify the models
Promise.promisifyAll(cdtModel);
Promise.promisifyAll(serviceModel);
Promise.promisifyAll(primaryServiceModel);
Promise.promisifyAll(supportServiceModel);

//radius for the coordinate search
const _radius = 1500;
let instance = null;

/**
 * Provider
 */
export default class {

    constructor () {
        if (!instance) {
            mongoose.connection.on('error', function (err) {
                console.log('[ERROR] Mongoose default connection error: ' + err);
            });
            instance = this;
        }
        return instance;
    }

    /**
     * Create a connection to MongoDB
     * @param url The database url
     */
    createConnection (url) {
        if (!_.isUndefined(url)) {
            mongoose.connect(url);
            console.log('[INFO] Successfully connected to the database');
        } else {
            throw Error('No database URL specified');
        }
    }

    /**
     * Close the connection with MongoDB
     */
    closeConnection () {
        mongoose.connection.close();
    }

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
    getCdt (idCDT) {
        return new Promise ((resolve, reject) => {
            cdtModel
                .findOne({_id: mongoose.Types.ObjectId(idCDT)})
                .lean()
                .exec((err, result) => {
                    if (err) {
                        reject(err);
                    }
                    return resolve(result);
                });
        });
    }

    /**
     * Create the list of descendant nodes of the specified nodes.
     * These nodes must have the 'value' attribute defined
     * @param idCDT The CDT identifier
     * @param nodes The node or the list of nodes
     * @returns {*} The list of son nodes
     */
    getNodeDescendants (idCDT, nodes) {
        if (!_.isUndefined(idCDT) && !_.isUndefined(nodes) && !_.isEmpty(nodes)) {
            //adapt the inputs for the search
            if (!_.isArray(nodes)) {
                nodes = _.toArray(nodes);
            } else {
                nodes = _.map(nodes, 'value');
            }
            return cdtModel
                .aggregateAsync(
                    {$match: {_id: idCDT}},
                    {$unwind: '$context'},
                    {$match: {'context.parents': {$in: nodes}}},
                    {
                        $group: {
                            _id: '$_id',
                            context: {
                                $push: {
                                    dimension: '$context.name',
                                    values: '$context.values'
                                }
                            }
                        }
                    }
                );
        }
    }

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
    getServiceByOperationId (idOperation) {
        if (!_.isUndefined(idOperation)) {
            return serviceModel.findByOperationIdAsync(idOperation);
        }
    }

    /**
     * Retrieve the service descriptions for the requested operations.
     * This schema contains only the requested operations.
     * @param idOperations The list of operation identifiers
     * @returns {*} Returns the service list with only the requested operations
     */
    getServicesByOperationIds (idOperations) {
        if (!_.isUndefined(idOperations)) {
            return serviceModel.findByOperationIdsAsync(idOperations);
        }
    }

    /**
     * Retrieve a service description by it's name and operation name.
     * @param serviceNames The object containing the service and operation names.
     * This object must be in form { name: 'service name', operation: 'operation name' }
     * @returns {*} The service and operation description
     */
    getServicesByNames (serviceNames) {
        if (!_.isUndefined(serviceNames) && !_.isEmpty(serviceNames)) {
            let whereClause = {
                $or: []
            };
            whereClause.$or = _.map(serviceNames, s => {
                return {
                    $and: [{
                        name: s.name,
                        'operations.name': s.operation
                    }]
                };
            });
            return serviceModel.findAsync(whereClause);
        }
    }

    /**
     * -------------------------------------
     * PRIMARY SERVICE ASSOCIATION METHODS
     * -------------------------------------
     */

    /**
     * Search the services that are associated to the specified attributes.
     * These attributes must have this format:
     * { dimension: 'dimension name', value: 'associated value' }
     * @param idCDT The CDT identifier
     * @param attributes The list of filter nodes selected
     * @returns {*} The list of operation id, with ranking and weight, of the found services
     */
    filterPrimaryServices (idCDT, attributes) {
        if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes)) {
            let associations = _.map(attributes, a => {
                return {
                    'associations.dimension': a.dimension,
                    'associations.value': a.value
                }
            });
            let clause = [
                {
                    $match: {
                        _idCDT: idCDT
                    }
                },
                {
                    $unwind: '$associations'
                },
                {
                    $match: {
                        $or: associations
                    }
                },
                {
                    $project: {
                        _idOperation: '$_idOperation',
                        ranking: '$associations.ranking',
                        _id: 0
                    }
                }
            ];
            return primaryServiceModel.aggregateAsync(clause);
        } else {
            return [];
        }
    }

    /**
     * Search the primary services that are associated near the current position
     * @param idCdt The CDT identifier
     * @param node The current position node
     * @returns {*} The list of operation identifiers found
     */
    searchPrimaryByCoordinates (idCdt, node) {
        let radius = _radius / 6371;
        let latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value');
        let longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value');
        return primaryServiceModel.findAsync({
            _idCDT: idCdt,
            loc: {
                $near: [longitude, latitude],
                $maxDistance: radius
            }
        }, {_idOperation: 1, _id: 0});
    }

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
     * @returns {*} The list of services found, with the number of constraints defined for each operation and the count of constraint that are satisfied
     */
    filterSupportServices (idCDT, category, attributes) {
        if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes)) {
            let associations = _.map(attributes, a => {
                return {
                    'associations.dimension': a.dimension,
                    'associations.value': a.value
                }
            });
            let clause = [
                {
                    $match: {
                        _idCDT: idCDT,
                        category: category
                    }
                },
                {
                    $unwind: '$associations'
                },
                {
                    $match: {
                        $or: associations
                    }
                },
                {
                    $project: {
                        _idOperation: '$_idOperation',
                        dimension: '$associations.dimension',
                        value: '$associations.value',
                        constraintCount: '$constraintCount',
                        _id: 0
                    }
                }
            ];
            return supportServiceModel.aggregateAsync(clause);
        }
    }

    /**
     * Search the support services that are associated near the current position
     * @param idCdt The CDT identifier
     * @param node The current position node
     * @returns {*} The list of operation identifiers found
     */
    searchSupportByCoordinates (idCdt, node) {
        let radius = _radius / 6371;
        let latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value');
        let longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value');
        return supportServiceModel.findAsync({
            _idCDT: idCdt,
            loc: {
                $near: [longitude, latitude],
                $maxDistance: radius
            }
        }, {_idOperation: 1, _id: 0});
    }
}