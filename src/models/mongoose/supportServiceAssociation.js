'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId


/**
 * Schema for support services associations with the CDT nodes
 */
const supportServiceSchema = new Schema ({
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
    dimension: String,
    value: String,
    loc: {
        type: [Number], //[Longitude, Latitude]
        index: '2d'
    }
})

/**
 * Schema for support services constraints count
 */
const supportServiceConstraintSchema = new Schema({
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
    }
})

const supportAssociation = mongoose.model('support_service', supportServiceSchema)
const supportConstraint = mongoose.model('support_constraint', supportServiceConstraintSchema)

export {
    supportAssociation,
    supportConstraint
}