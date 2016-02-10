'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'
import Promise from 'bluebird'

//load the models
import {
    cdtModel,
    globalCdtModel
} from '../models/mongoose/cdtDescription'
import {
    serviceModel,
    operationModel
} from '../models/mongoose/serviceDescription'
import primaryServiceModel from '../models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from '../models/mongoose/supportServiceAssociation'
import userModel from '../models/mongoose/user'

//radius for the coordinate search
const _radius = 1500
let instance = null

const ObjectId = mongoose.Types.ObjectId;

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
                console.log('[ERROR] Mongoose default connection error: ' + err)
            })
            instance = this
        }
        return instance
    }

    /**
     * Create a connection to MongoDB
     * @param {String} url - The database url
     */
    createConnection (url) {
        if (!_.isUndefined(url)) {
            mongoose.connect(url)
            console.log('[INFO] Successfully connected to the database')
        } else {
            throw Error('No database URL specified')
        }
    }

    /**
     * Close the connection with MongoDB
     */
    closeConnection () {
        mongoose.connection.close()
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
    getCdtById (idCDT) {
        return new Promise ((resolve, reject) => {
            cdtModel.collection
                .find({_id: ObjectId(idCDT)})
                .limit(1)
                .toArray((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        resolve(results[0])
                    } else {
                        reject('No CDT found for the provided identifier')
                    }
                })
        })
    }

    /**
     * Retrieve the CDT schema associated to the user. If the user hasn't got any CDT associated it retrieves the global one
     * @param {String} userId - The user's identifier
     * @returns {Object} The CDT schema found
     */
    getCdtByUser (userId) {
        return new Promise ((resolve, reject) => {
            cdtModel.collection
                .find({_userId: ObjectId(userId)})
                .limit(1)
                .toArray((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        resolve(results[0])
                    } else {
                        //get the global CDT
                        globalCdtModel
                            .find({})
                            .limit(1)
                            .populate('globalId')
                            .lean()
                            .exec((err, results) => {
                                if (err) {
                                    reject(err)
                                }
                                if (results.length === 1) {
                                    resolve(results[0].globalId)
                                } else {
                                    reject('No global CDT defined')
                                }
                            })
                    }
                })
        })
    }

    /**
     * Return the global CDT
     * @returns {Object} The global CDT
     */
    getGlobalCdt () {
        return new Promise ((resolve, reject) => {
            globalCdtModel
                .find({})
                .limit(1)
                .populate('globalId')
                .lean()
                .exec((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        resolve(results[0].globalId)
                    } else {
                        reject('No global CDT defined')
                    }
                })
        })
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
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idOperation)) {
                operationModel
                    .find({_id: idOperation})
                    .limit(1)
                    .populate('service')
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results[0])
                    })
            } else {
                resolve({})
            }
        })
    }

    /**
     * Retrieve the service descriptions for the requested operations.
     * This schema contains only the requested operations.
     * @param {Array} idOperations - The list of operation identifiers
     * @returns {Array} Returns the service list with only the requested operations
     */
    getServicesByOperationIds (idOperations) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idOperations)) {
                operationModel
                    .find({_id: {$in: idOperations}})
                    .populate('service')
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
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
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes)) {
                let clause = {
                    _idCDT: idCDT,
                    $or: []
                }
                clause.$or = _.map(attributes, a => {
                    return {
                        dimension: a.name,
                        value: a.value
                    }
                })
                const projection = {
                    _idOperation: 1,
                    ranking: 1,
                    _id: 0
                }
                primaryServiceModel.collection
                    .find(clause, projection)
                    .toArray((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
    }

    /**
     * Search the primary services that are associated near the current position
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The current position node
     * @returns {Array} The list of operation identifiers found
     */
    searchPrimaryByCoordinates (idCdt, node) {
        return new Promise ((resolve, reject) => {
            const radius = _radius / 6371
            const latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value')
            const longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value')
            if (!_.isUndefined(latitude) && !_.isUndefined(longitude)) {
                primaryServiceModel
                    .find({
                        _idCDT: idCdt,
                        loc: {
                            $near: [longitude, latitude],
                            $maxDistance: radius
                        }
                    }, {_idOperation: 1, _id: 0})
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
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
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idCDT) && !_.isUndefined(attributes) && !_.isEmpty(attributes) && !_.isUndefined(category)) {
                let clause = {
                    _idCDT: idCDT,
                    category: category,
                    $or: []
                }
                clause.$or = _.map(attributes, a => {
                    return {
                        dimension: a.name,
                        value: a.value
                    }
                })
                const projection = {
                    _idOperation: 1,
                    _id: 0
                }
                supportAssociation.collection
                    .find(clause, projection)
                    .toArray((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
    }

    getServicesConstraintCount (idCDT, category, idOperations) {
        return new Promise ((resolve, reject) => {
           if (!_.isUndefined(idCDT) && !_.isUndefined(category) && !_.isUndefined(idOperations) && !_.isEmpty(idOperations)) {
               const clause = {
                   _idCDT: idCDT,
                   category: category,
                   _idOperation: {
                       $in: idOperations
                   }
               }
               const projection = {_idOperation: 1, constraintCount: 1, _id: 0}
               supportConstraint.collection
                   .find(clause, projection)
                   .toArray((err, results) => {
                       if (err) {
                           reject(err)
                       }
                       resolve(results)
                   })
           } else {
               resolve([])
           }
        })
    }

    /**
     * Search the support services that are associated near the current position
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The current position node
     * @returns {Array} The list of operation identifiers found
     */
    searchSupportByCoordinates (idCdt, node) {
        return new Promise ((resolve, reject) => {
            const radius = _radius / 6371
            const latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value')
            const longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value')
            if (!_.isUndefined(latitude) && !_.isUndefined(longitude)) {
                supportAssociation
                    .find({
                        _idCDT: idCdt,
                        loc: {
                            $near: [longitude, latitude],
                            $maxDistance: radius
                        }
                    }, {_idOperation: 1, _id: 0})
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
    }

    /**
     * USER METHODS
     */

    /**
     * Retrieve user's details based on mail and password
     * @param {String} mail - The user's email address
     * @param {String} password - The user's password
     * @returns {Object} The user's details
     */
    getUser (mail, password) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(mail) && !_.isUndefined(password)) {
                userModel
                    .find({
                        mail: mail,
                        password: password
                    })
                    .limit(1)
                    .exec((err, user) => {
                        if (err) {
                            reject(err)
                        }
                        if (user.length === 1) {
                            resolve(user[0])
                        } else {
                            reject('Invalid mail or password')
                        }
                    })
            } else {
                reject('Invalid mail or password')
            }
        })
    }

    /**
     * Check if the user is correctly logged in
     * @param {String} id - The user's identifier
     * @param {String} token - The session token
     * @returns {Boolean} If the function returns true, then the user is correctly logged into the system, otherwise returns an error message
     */
    checkUserLogin (id, token) {
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(id) && !_.isUndefined(token)) {
                userModel
                    .find({
                        _id: ObjectId(id),
                        token: token
                    })
                    .limit(1)
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        if (results.length === 1) {
                            resolve(true)
                        } else {
                            reject('User not logged in')
                        }
                    })
            } else {
                reject('User not logged in')
            }
        })
    }
}