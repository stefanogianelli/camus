'use strict';

import  mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const types = 'primary support'.split(' ');
const separators = 'csv ssv tsv pipes'.split(' ');
const protocols = 'rest query custom'.split(' ');
const paginationTypes = 'number token'.split(' ');

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
    mappingTerm: [String]
});

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
});

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
});

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
});

/**
 * Response schema
 */
const responseSchema = new Schema({
    list: String,
    items: [itemSchema],
    functions: [operateSchema]
});

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
    pageCountAttribute: String,
    delay: {
        type: Number,
        min: 0,
        default: 0
    }
});

/**
 * Operation schema
 */
const operationSchema = new Schema({
    _id: {
        type: ObjectId,
        default: function () {
            return new mongoose.Types.ObjectId()
        },
        index: true
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
    responseMapping: responseSchema,
    pagination: paginationSchema
});

/**
 * Description schema
 */
const serviceDescriptionSchema = new Schema({
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
/*serviceDescriptionSchema.static('findByOperationId', function (idOperation, callback) {
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
})*/
serviceDescriptionSchema.static('findByOperationId', function (idOperation, callback) {
    this
        .aggregate(
            {$unwind: '$operations'},
            {$match: {'operations._id': idOperation}}
            , callback);
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

const serviceDescription = mongoose.model('service_description', serviceDescriptionSchema);

export default serviceDescription;