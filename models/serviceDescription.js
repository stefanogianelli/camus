var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var types = 'primary support'.split(' ');
var separators = 'csv ssv tsv pipes'.split(' ');
var protocols = 'rest query custom'.split(' ');

/**
 * Parameter schema
 */
var parameterSchema = new Schema({
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
    transformFunction: String
});

/**
 * Header schema
 */
var headerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

/**
 * Item schema
 */
var itemSchema = new Schema({
    termName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
});

/**
 * Operate schema
 */
var operateSchema = new Schema({
    run: {
        type: String,
        required: true
    },
    onAttribute: {
        type: String,
        required: true
    }
});

/**
 * Response schema
 */
var responseSchema = new Schema({
    list: {
        type: String,
        required: true
    },
    item: [itemSchema],
    operate: [operateSchema]
});

/**
 * Operation schema
 */
var operationSchema = new Schema({
    _id: {
        type: ObjectId,
        default: function () {
            return new mongoose.Types.ObjectId()
        }
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    path: String,
    bridgeName: String,
    parameters: [parameterSchema],
    headers: [headerSchema],
    responseMapping: responseSchema
});

/**
 * Description schema
 */
var serviceDescriptionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        required: true,
        enum: types
    },
    protocol: {
        type: String,
        required: true,
        enum: protocols
    },
    category: String,
    basePath: String,
    operations: [operationSchema]
});

/**
 * Define the 'findByOperationId' method
 */
serviceDescriptionSchema.static('findByOperationId', function (idOperation, callback) {
    this
        .findOne({
            'operations._id': idOperation
        },
        {
            name: 1,
            type: 1,
            protocol: 1,
            category: 1,
            basePath: 1,
            operations: {
                $elemMatch: {
                    '_id': idOperation
                }
            }
        }, callback);
});

var serviceDescription = mongoose.model('service_description', serviceDescriptionSchema);

module.exports = serviceDescription;