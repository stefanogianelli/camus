'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const forEnum = 'filter parameter ranking filter|parameter ranking|parameter'.split(' ')

/**
 * Field schema
 */
const fieldSchema = new Schema({
    name: {
        type: String,
        required: true
    }
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
    enum: [String],
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
    _userId: {
        type: ObjectId,
        ref: 'user'
    },
    context: [NodeSchema]
})

const cdtModel = mongoose.model('cdt_description', cdtSchema)

export default cdtModel
