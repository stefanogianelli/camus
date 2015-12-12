'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let forEnum = 'filter parameter ranking filter|parameter ranking|parameter'.split(' ');

/**
 * Field schema
 */
let fieldSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

/**
 * Parameter schema
 */
let ParameterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String,
    enum: [String],
    fields: [fieldSchema]
});

/**
 * Node schema
 */
let NodeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    for: {
        type: String,
        enum: forEnum,
        required: true
    },
    supportCategory: String,
    values: [String],
    parameters: [ParameterSchema],
    forbidden: [String],
    parents: [String],
    parent: String
});

/**
 * Schema for CDT
 */
let cdtSchema = new Schema ({
    _userId: String,
    context: [NodeSchema]
});

let cdtModel = mongoose.model('cdt_description', cdtSchema);

module.exports = cdtModel;