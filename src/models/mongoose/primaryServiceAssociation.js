'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

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
        required: true
    },
    dimension: String,
    value: String,
    ranking: {
        type: Number,
        min: 1
    },
    loc: {
        type: [Number], //[Longitude, Latitude]
        index: '2d'
    }
})

const primaryServiceAssociation = mongoose.model('primary_service', primaryServiceSchema)

export default primaryServiceAssociation