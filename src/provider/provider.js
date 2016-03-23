'use strict'

import _ from 'lodash'
import mongoose from 'mongoose'
import Promise from 'bluebird'
import config from 'config'
import Redis from 'ioredis'

import Metrics from '../utils/MetricsUtils'

//load the models
import {
    cdtModel,
    globalCdtModel
} from '../models/mongoose/cdtDescription'
import {
    operationModel
} from '../models/mongoose/serviceDescription'
import primaryServiceModel from '../models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from '../models/mongoose/supportServiceAssociation'
import userModel from '../models/mongoose/user'
import {
    mashupModel,
    globalMashupModel
} from '../models/mongoose/mashupSchema'

const ObjectId = mongoose.Types.ObjectId

let instance = null

/**
 * The Provider is used to collect all the methods that interacts with the databases.
 */
export default class Provider {

    /**
     * Class constructor.
     * Initialize the connection to MongoDB and Redis
     * @constructor
     */
    constructor () {
        //acquire db address. The environment variable address have the precedence over the configuration one
        this._dbUrl = null
        if (!_.isUndefined(process.env.MONGOLAB_URI) || !_.isUndefined(process.env.MONGO_URI)) {
            this._dbUrl = process.env.MONGOLAB_URI || process.env.MONGO_URI
        } else if (config.has('database.address')) {
            this._dbUrl = config.get('database.address')
        } else {
            throw Error('[ERROR] No database URL defined in the config file!')
        }
        //connect to the db
        mongoose.connect(this._dbUrl)
        console.log('[INFO] Successfully connected to the database')
        //define error logging
        mongoose.connection.on('error', function (err) {
            console.log('[ERROR] Mongoose default connection error: ' + err)
        })
        //acquire redis configuration
        this._redisAddress = 'localhost:6379'
        if (!_.isUndefined(process.env.REDIS_URL)) {
            this._redisAddress = process.env.REDIS_URL
        } else if (config.has('redis.address')) {
            this._redisAddress = config.get('redis.address')
        }
        //initialize redis connection
        this._redis = new Redis(this._redisAddress)
        //initialize metrics utility
        this._metricsFlag = false
        if (config.has('metrics')) {
            this._metricsFlag = config.get('metrics')
        }
        this._metrics = null
        if (this._metricsFlag) {
            this._metrics = Metrics.getInstance()
        }
        //radius for the coordinate search
        this._radius = 1500
    }

    /**
     * Return the Provider object
     * @returns {Object} The Provider instance
     */
    static getInstance () {
        if (!instance) {
            instance = new Provider()
        }
        return instance
    }

    /**
     * -------------------------------------
     * CDT METHODS
     * -------------------------------------
     */

    /**
     * Retrieve the CDT schema associated to the current identifier
     * @param {String} idCDT - The CDT's identifier
     * @returns {Promise<Object>} Returns the CDT schema
     * @throws {Error} If the identifier does not exists in the database
     */
    getCdtById (idCDT) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            cdtModel.collection
                .find({_id: ObjectId(idCDT)})
                .limit(1)
                .toArray((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getCdtById', 'DB', start)
                        }
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
     * @returns {Promise<Object>} The CDT schema found
     */
    getCdtByUser (userId) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            cdtModel.collection
                .find({_userId: ObjectId(userId)})
                .limit(1)
                .toArray((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getCdtByUser', 'DB', start)
                        }
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
                                    if (this._metricsFlag) {
                                        this._metrics.record('Provider', 'getCdtByUser', 'DB', start)
                                    }
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
     * @returns {Promise<Object>} The global CDT
     */
    getGlobalCdt () {
        const start = process.hrtime()
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
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getGlobalCdt', 'DB', start)
                        }
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
     * @returns {Promise<Object>} Returns the service and operation schema
     */
    getServiceByOperationId (idOperation) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idOperation) && !_.isEmpty(idOperation)) {
                operationModel
                    .find({_id: idOperation})
                    .limit(1)
                    .populate('service')
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getServiceByOperationId', 'DB', start)
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
     * @returns {Promise<Array>} Returns the service list with only the requested operations
     */
    getServicesByOperationIds (idOperations) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(idOperations) && !_.isEmpty(idOperations)) {
                operationModel
                    .find({_id: {$in: idOperations}})
                    .populate('service')
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getServicesByOperationIds', 'DB', start)
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
     * @returns {Promise<Array>} The list of operation id, with ranking and weight, of the found services
     */
    filterPrimaryServices (idCDT, attributes) {
        const start = process.hrtime()
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
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'filterPrimaryServices', 'DB', start)
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
     * @returns {Promise<Array>} The list of operation identifiers found
     */
    searchPrimaryByCoordinates (idCdt, node) {
        return this._searchByCoordinates(primaryServiceModel, idCdt, node, 'searchPrimaryByCoordinates')
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
     * @returns {Promise<Array>} The list of services found, with the number of constraints defined for each operation and the count of constraint that are satisfied
     */
    filterSupportServices (idCDT, category, attributes) {
        const start = process.hrtime()
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
                const projection = { _idOperation: 1, _id: 0 }
                supportAssociation.collection
                    .find(clause, projection)
                    .toArray((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'filterSupportServices', 'DB', start)
                        }
                        resolve(results)
                    })
            } else {
                resolve([])
            }
        })
    }

    /**
     * Search the constraints number associated to an operation
     * @param {ObjectId} idCDT - The CDT identifier
     * @param {String} category The support service category
     * @param {Array} idOperations The operations identifiers
     * @returns {Promise<Array>} The list of services identifiers with associated the constraint count
     */
    getServicesConstraintCount (idCDT, category, idOperations) {
        const start = process.hrtime()
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
                       if (this._metricsFlag) {
                           this._metrics.record('Provider', 'getServicesConstraintCount', 'DB', start)
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
     * @returns {Promise<Array>} The list of operation identifiers found
     */
    searchSupportByCoordinates (idCdt, node) {
        return this._searchByCoordinates(supportAssociation, idCdt, node, 'searchSupportByCoordinates')
    }

    /**
     * -------------------------------------
     * USER METHODS
     * -------------------------------------
     */

    /**
     * Retrieve user's details based on mail and password
     * @param {String} mail - The user's email address
     * @param {String} password - The user's password
     * @returns {Promise<Object>} The user's details
     */
    getUser (mail, password) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(mail) && !_.isUndefined(password)) {
                userModel
                    .find({
                        mail: mail,
                        password: password
                    }, {
                        token: 0,
                        password: 0
                    })
                    .limit(1)
                    .exec((err, user) => {
                        if (err) {
                            reject(err)
                        }
                        if (user.length === 1) {
                            if (this._metricsFlag) {
                                this._metrics.record('Provider', 'getUser', 'DB', start)
                            }
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
     * @param {String} mail - The user's mail address
     * @param {String} token - The session token
     * @returns {Promise<Boolean>} If the function returns true, then the user is correctly logged into the system, otherwise returns an error message
     */
    checkUserLogin (mail, token) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            if (!_.isUndefined(mail) && !_.isUndefined(token)) {
                userModel
                    .find({
                        mail: mail,
                        token: token
                    }, {
                        token: 0,
                        password: 0
                    })
                    .limit(1)
                    .lean()
                    .exec((err, results) => {
                        if (err) {
                            reject(err)
                        }
                        if (results.length === 1) {
                            if (this._metricsFlag) {
                                this._metrics.record('Provider', 'checkUserLogin', 'DB', start)
                            }
                            resolve(results[0])
                        } else {
                            reject('User not logged in')
                        }
                    })
            } else {
                reject('User not logged in')
            }
        })
    }

    /**
     * Search for customized mashup for the current user. If no mashup is found, it returns the universal mashup schema, valid for all users
     * @param userId The user's identifier
     * @returns {Promise<Object>} The user's mashup if exists, otherwise returns the global mashup
     */
    getUserMashup (userId) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            mashupModel.collection
                .find({_userId: ObjectId(userId)})
                .limit(1)
                .toArray((err, results) => {
                    if (err) {
                        reject(err)
                    }
                    if (results.length === 1) {
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', 'getUserMashup', 'DB', start)
                        }
                        resolve(results[0])
                    } else {
                        //get the global CDT
                        globalMashupModel
                            .find({})
                            .limit(1)
                            .populate('mashupId')
                            .lean()
                            .exec((err, results) => {
                                if (err) {
                                    reject(err)
                                }
                                if (results.length === 1) {
                                    if (this._metricsFlag) {
                                        this._metrics.record('Provider', 'getUserMashup', 'DB', start)
                                    }
                                    resolve(results[0].mashupId)
                                } else {
                                    reject('No global mashup defined')
                                }
                            })
                    }
                })
        })
    }

    /**
     * -------------------------------------
     * COMMON METHODS
     * -------------------------------------
     */

    /**
     * Search the services that are associated near the current position
     * It uses the global variable 'radius' as the maximum radius for the search
     * @param {Object} model - The mongoose model that will be used to search the services
     * @param {ObjectId} idCdt - The CDT identifier
     * @param {Object} node - The current position node
     * @param {String} metricsName - The function's appearing name in the metrics log
     * @returns {Promise<Array>} The list of operation identifiers found
     * @private
     */
    _searchByCoordinates (model, idCdt, node, metricsName) {
        const start = process.hrtime()
        return new Promise ((resolve, reject) => {
            const radius = this._radius / 6371
            const latitude = _.result(_.find(node.fields, {name: 'Latitude'}), 'value')
            const longitude = _.result(_.find(node.fields, {name: 'Longitude'}), 'value')
            if (!_.isUndefined(latitude) && !_.isUndefined(longitude)) {
                model
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
                        if (this._metricsFlag) {
                            this._metrics.record('Provider', metricsName, 'DB', start)
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
     * REDIS METHODS
     * -------------------------------------
     */

    /**
     * Get the value associated to the specified key
     * @param {String} key - The key to be searched
     * @returns {Promise<Object>} The value saved in the cache
     */
    getRedisValue (key) {
        if (_.isNull(key) || _.isUndefined(key)) {
            throw new Error('Please specify a key to be searched')
        }
        return this._redis.get(key)
    }

    /**
     * Create a new key and associate the specified value
     * @param {String} key - The key to be created
     * @param {Object} value - The value to be associated to the specified key
     * @param {Number} ttl - The time the key live in the cache, in seconds
     */
    setRedisValue (key, value, ttl) {
        if (_.isNull(key) || _.isUndefined(key)) {
            throw new Error('Please specify a key')
        }
        if (_.isNull(value) || _.isUndefined(value)) {
            throw new Error('Please specify a value')
        }
        if (!_.isNumber(ttl)) {
            throw new Error('The ttl must be a number')
        }
        this._redis.set(key, value, 'EX', ttl)
    }
}