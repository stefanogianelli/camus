'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

let types = 'primary support'.split(' ');
let separators = 'csv ssv tsv pipes'.split(' ');
let protocols = 'rest query custom'.split(' ');

/**
 * Parameter schema
 */
let parameterSchema = new Schema({
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
    mappingTerm: [String]
});

/**
 * Header schema
 */
let headerSchema = new Schema({
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
let itemSchema = new Schema({
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
let operateSchema = new Schema({
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
let responseSchema = new Schema({
    list: String,
    items: [itemSchema],
    functions: [operateSchema]
});

/**
 * Operation schema
 */
let operationSchema = new Schema({
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
let serviceDescriptionSchema = new Schema({
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
        enum: protocols
    },
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

/**
 * Define the 'findByOperationIds' method
 */
serviceDescriptionSchema.static('findByOperationIds', function (idOperations, callback) {
    this
        .aggregate(
            {$unwind: '$operations'},
            {$match: {'operations._id': {$in: idOperations}}}
        , callback);
});

let serviceDescription = mongoose.model('service_description', serviceDescriptionSchema);

module.exports = serviceDescription;