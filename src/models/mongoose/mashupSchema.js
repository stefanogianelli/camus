'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

/**
 * Content Schema
 */
const contentSchema = new Schema({
    type: String,
    style: String,
    contents: [String]
})

/**
 * Item Schema
 */
const itemSchema = new Schema({
    topics: [String],
    contents: [contentSchema]
})

/**
 * Mashup Schema
 */
const mashupSchema = new Schema({
    _userId: [ObjectId],
    list: [itemSchema],
    details: [itemSchema]
})

const globalMashup = new Schema({
    mashupId: {
        type: ObjectId,
        ref: 'mashup_schema'
    }
})

const mashupModel = mongoose.model('mashup_schema', mashupSchema)
const globalMashupModel = mongoose.model('global_mashup', globalMashup)

export {
    mashupModel,
    globalMashupModel
}