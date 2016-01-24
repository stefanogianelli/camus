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

    /**
     * Create the instance
     * @constructor
     */
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
     * @param {String} url - The database url
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
     * @param {String} idCDT - The CDT identifier
     * @returns {Object} Returns the CDT schema
     * @throws {Error} If the identifier does not exists in the database
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
     * -------------------------------------
     * SERVICE DESCRIPTION METHODS
     * -------------------------------------
     */

    /**
     * Retrieve the service description for the requested operation.
     * This schema contains only the requested operation.
     * @param {ObjectId} idOperation - The operation identifier
     * @returns {Object} Returns the service and operation schema
     */
    getServiceByOperationId (idOperation) {
        if (!_.isUndefined(idOperation)) {
            return serviceModel
                .aggregateAsync(
                    {$unwind: '$operations'},
                    {$match: {'operations._id': idOperation}})
                .then(results => {
                    return results[0];
                })
        } else {
            return {};
        }
    }

    /**
     * Retrieve the service descriptions for the requested operations.
     * This schema contains only the requested operations.
     * @param {Array} idOperations - The list of operation identifiers
     * @returns {Array} Returns the service list with only the requested operations
     */
    getServicesByOperationIds (idOperations) {
        if (!_.isUndefined(idOperations)) {
            return serviceModel.findByOperationIdsAsync(idOperations);
        } else {
            return [];
        }
    }

    /**
     * Retrieve a service description by it's name and operation name.
     * @param {Object} serviceNames - The object containing the service and operation names.
     * This object must be in form { name: 'service name', operation: 'operation name' }
     * @returns {Array} The service and operation description
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
        } else {
            return [];
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
     * { name: 'dimension name', value: 'associated value' }
     * @param {ObjectId} idCDT - The CDT identifier
     * @param {Array} attributes - The list of filter nodes selected
     * @returns {Array} The list of operation id, with ranking and weight, of the found services
     */
    filterPrimaryServices (idCDT, attributes) {
        if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes)) {
            let associations = _.map(attributes, a => {
                return {
                    'associations.dimension': a.name,
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
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The current position node
     * @returns {Array} The list of operation identifiers found
     */
    searchPrimaryByCoordinates (idCdt, node) {
        let radius = _radius / 6371;
        let latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value');
        let longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value');
        if (!_.isUndefined(latitude) && !_.isUndefined(longitude)) {
            return primaryServiceModel.findAsync({
                _idCDT: idCdt,
                loc: {
                    $near: [longitude, latitude],
                    $maxDistance: radius
                }
            }, {_idOperation: 1, _id: 0});
        } else {
            return Promise.resolve([]);
        }
    }

    /**
     * -------------------------------------
     * SUPPORT SERVICE ASSOCIATION METHODS
     * -------------------------------------
     */

    /**
     * Search the support services associated to specific attributes
     * @param {ObjectId} idCDT - The CDT identifier
     * @param {String} category - The service category
     * @param {Array} attributes - The list of attributes
     * @returns {Array} The list of services found, with the number of constraints defined for each operation and the count of constraint that are satisfied
     */
    filterSupportServices (idCDT, category, attributes) {
        if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes)) {
            let associations = _.map(attributes, a => {
                return {
                    'associations.dimension': a.name,
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
        } else {
            return [];
        }
    }

    /**
     * Search the support services that are associated near the current position
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The current position node
     * @returns {Array} The list of operation identifiers found
     */
    searchSupportByCoordinates (idCdt, node) {
        let radius = _radius / 6371;
        let latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value');
        let longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value');
        if (!_.isUndefined(latitude) && !_.isUndefined(longitude)) {
            return supportServiceModel.findAsync({
                _idCDT: idCdt,
                loc: {
                    $near: [longitude, latitude],
                    $maxDistance: radius
                }
            }, {_idOperation: 1, _id: 0});
        } else {
            return Promise.resolve([]);
        }
    }
}