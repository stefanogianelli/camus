'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const forEnum = 'filter parameter ranking filter|parameter ranking|parameter'.split(' ')

/**
 * Default values schema
 */
const defaultSchema = new Schema({
    dimension: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
})

/**
 * Field schema
 */
const fieldSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String
})

/**
 * Parameter schema
 */
const ParameterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String,
    fields: [fieldSchema]
})

/**
 * Node schema
 */
const NodeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    for: {
        type: String,
        enum: forEnum,
        required: true
    },
    values: [String],
    parameters: [ParameterSchema],
    parents: [String]
})

/**
 * Schema for CDT
 */
const cdtSchema = new Schema ({
    _userId: [ObjectId],
    context: [NodeSchema],
    defaultValues: [defaultSchema]
})

/**
 * Schema for the global CDT
 */
const globalCdtSchema = new Schema({
    globalId: {
        type: ObjectId,
        ref: 'cdt_description'
    }
})

const cdtModel = mongoose.model('cdt_description', cdtSchema)
const globalCdtModel = mongoose.model('global_cdt', globalCdtSchema)

export {
    cdtModel,
    globalCdtModel
}