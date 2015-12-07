var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var forEnum = 'filter parameter ranking filter|parameter ranking|parameter'.split(' ');

/**
 * Parameter schema
 */
var ParamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String,
    format: String,
    searchFunction: String,
    enum: [String]
});

/**
 * Node schema
 */
var NodeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    for: {
        type: String,
        enum: forEnum,
        required: true
    },
    transformFunction: String,
    supportCategory: String,
    values: [String],
    params: [ParamSchema],
    forbidden: [String],
    parents: [String]
});

/**
 * Schema for CDT
 */
var cdtSchema = new Schema ({
    _userId: String,
    context: [NodeSchema]
});

var cdtModel = mongoose.model('cdt_description', cdtSchema);

module.exports = cdtModel;