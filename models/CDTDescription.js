var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var forEnum = 'filter parameter filter|parameter'.split(' ');

/**
 * Parameter schema
 */
var ParamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: String,
    searchFunction: String,
    enum: [String]
});

/**
 * Node schema
 */
var NodeSchema = new Schema();
NodeSchema.add({
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
    supportDimension: String,
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