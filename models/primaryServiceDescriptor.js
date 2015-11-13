var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var primaryServiceSchema = new Schema ({
    _idOperation: Schema.ObjectId,
    dimension: String,
    value: String,
    ranking: Number,
    weight: Number,
    _idCDT: Schema.ObjectId
});

var primaryServiceDescriptor = mongoose.model('primary_service', primaryServiceSchema);

module.exports = primaryServiceDescriptor;