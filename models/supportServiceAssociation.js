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
    }
});

/**
 * Schema for support services associations with the CDT nodes
 */
var supportServiceSchema = new Schema ({
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
    associations: [associationSchema]
});

var supportServiceAssociation = mongoose.model('support_service', supportServiceSchema);

module.exports = supportServiceAssociation;