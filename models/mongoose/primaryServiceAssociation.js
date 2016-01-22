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
    },
    ranking: {
        type: Number,
        min: 1
    }
});

associationSchema.index({ dimension: 1, value: 1 });

/**
 * Schema for primary services associations with the CDT nodes
 */
const primaryServiceSchema = new Schema ({
    _idOperation: {
        type: ObjectId,
        required: true
    },
    _idCDT: {
        type: ObjectId,
        required: true,
        index: true
    },
    associations: [associationSchema],
    loc: {
        type: [Number], //[Longitude, Latitude]
        index: '2d'
    }
});

const primaryServiceAssociation = mongoose.model('primary_service', primaryServiceSchema);

export default primaryServiceAssociation;