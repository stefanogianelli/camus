'use strict';

import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

/**
 * Schema for associations
 */
const associationSchema = new Schema({
    dimension: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

associationSchema.index({ dimension: 1, value: 1});

/**
 * Schema for support services associations with the CDT nodes
 */
const supportServiceSchema = new Schema ({
    _idCDT: {
        type: ObjectId,
        required: true,
        index: true
    },
    _idOperation: {
        type: ObjectId,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    constraintCount: {
        type: Number,
        required: true,
        default: 0
    },
    associations: [associationSchema],
    loc: {
        type: [Number], //[Longitude, Latitude]
        index: '2d'
    }
});

const supportServiceAssociation = mongoose.model('support_service', supportServiceSchema);

export default supportServiceAssociation;