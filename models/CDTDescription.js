var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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
        required: true
    },
    transformFunction: String,
    supportDimension: String,
    nodes: [NodeSchema],
    params: [ParamSchema],
    forbidden: [String]
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