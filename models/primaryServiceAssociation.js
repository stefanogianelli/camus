var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Schema for associations
 */
var associationSchema = new Schema({
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

/**
 * Schema for geographic association
 */
var geoSchema = new Schema({
    coord: {
        type: [Number], //[Longitude, Latitude]
        index: '2d'
    },
    radius: {
        type: Number,
        required: true
    }
});

/**
 * Schema for primary services associations with the CDT nodes
 */
var primaryServiceSchema = new Schema ({
    _idOperation: {
        type: ObjectId,
        required: true
    },
    _idCDT: {
        type: ObjectId,
        required: true
    },
    associations: [associationSchema],
    geo: geoSchema
});

var primaryServiceAssociation = mongoose.model('primary_service', primaryServiceSchema);

module.exports = primaryServiceAssociation;