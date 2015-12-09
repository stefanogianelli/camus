var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Schema for primary services associations with the CDT nodes
 */
var primaryServiceSchema = new Schema ({
    _idOperation: {
        type: ObjectId,
        required: true
    },
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
    },
    _idCDT: {
        type: ObjectId,
        required: true
    }
});

var primaryServiceAssociation = mongoose.model('primary_service', primaryServiceSchema);

module.exports = primaryServiceAssociation;