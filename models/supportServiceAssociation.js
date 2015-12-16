'use strict';

import mongoose from 'mongoose';

let Schema = mongoose.Schema;
let ObjectId = Schema.Types.ObjectId;

/**
 * Schema for associations
 */
let associationSchema = new Schema({
    dimension: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

/**
 * Schema for support services associations with the CDT nodes
 */
let supportServiceSchema = new Schema ({
    _idCDT: {
        type: ObjectId,
        required: true
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

let supportServiceAssociation = mongoose.model('support_service', supportServiceSchema);

export default supportServiceAssociation;