var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var parameterSchema = new Schema({
    name: String,
    description: String,
    required: Boolean,
    type: String,
    default: String,
    mappingCDT: String,
    mappingTerm: String,
    transformFunction: String
});

var headerSchema = new Schema({
    name: String,
    value: String
});

var itemSchema = new Schema({
    termName: String,
    path: String
});

var operateSchema = new Schema({
    run: String,
    on: String
});

var responseSchema = new Schema({
    list: String,
    item: [itemSchema],
    operate: [operateSchema]
});

var operationSchema = new Schema({
    _id: Schema.ObjectId,
    name: String,
    description: String,
    path: String,
    bridgeName: String,
    parameters: [parameterSchema],
    headers: [headerSchema],
    responseMapping: [responseSchema]
});

var serviceDescriptorSchema = new Schema({
    name: String,
    description: String,
    type: String,
    protocol: String,
    category: String,
    basePath: String,
    operations: [operationSchema]
});

var serviceDescriptor = mongoose.model('serviceDescriptor', serviceDescriptorSchema);

module.exports = serviceDescriptor;