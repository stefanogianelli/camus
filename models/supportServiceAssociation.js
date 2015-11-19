var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
 * Schema for support services associations with the CDT nodes
 */
var supportServiceSchema = new Schema ({
    _idOperation: {
        type: ObjectId,
        required: true
    },
    category: {
        type: String,
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
    require: String,
    _idCDT: {
        type: ObjectId,
        required: true
    }
});

var supportServiceAssociation = mongoose.model('support_service', supportServiceSchema);

module.exports = supportServiceAssociation;