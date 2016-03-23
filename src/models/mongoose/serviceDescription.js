'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const types = 'primary support'.split(' ')
const separators = 'csv ssv tsv pipes'.split(' ')
const protocols = 'rest query android custom'.split(' ')
const paginationTypes = 'number token'.split(' ')

/**
 * Translate schema
 */
const translateSchema = new Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    }
})

/**
 * Parameter schema
 */
const parameterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    required: {
        type: Boolean,
        default: false
    },
    type: String,
    default: String,
    collectionFormat: {
        type: String,
        enum: separators
    },
    mappingCDT: [String],
    mappingTerm: [String],
    translate: [translateSchema]
})

/**
 * Header schema
 */
const headerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
})

/**
 * Item schema
 */
const itemSchema = new Schema({
    termName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
})

/**
 * Operate schema
 */
const operateSchema = new Schema({
    run: {
        type: String,
        required: true
    },
    onAttribute: {
        type: String,
        required: true
    }
})

/**
 * Response schema
 */
const responseSchema = new Schema({
    list: String,
    items: [itemSchema],
    functions: [operateSchema]
})

/**
 * Pagination Schema
 */
const paginationSchema = new Schema({
    attributeName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: paginationTypes
    },
    tokenAttribute: String,
    pageCountAttribute: String
})

/**
 * Operation schema
 */
const operationSchema = new Schema({
    service: {
        type: ObjectId,
        ref: 'service'
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: types
    },
    description: String,
    protocol: {
        type: String,
        enum: protocols
    },
    path: String,
    storeLink: String,
    bridgeName: String,
    parameters: [parameterSchema],
    headers: [headerSchema],
    responseMapping: responseSchema,
    pagination: paginationSchema
})

/**
 * Description schema
 */
const serviceDescriptionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    protocol: {
        type: String,
        enum: protocols
    },
    basePath: String
})

const serviceModel = mongoose.model('service', serviceDescriptionSchema)
const operationModel = mongoose.model('operation', operationSchema)

export {
    serviceModel,
    operationModel
}