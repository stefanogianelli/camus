var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var primaryServiceSchema = new Schema ({
    idOperation: Schema.ObjectId,
    dimension: String,
    value: String,
    ranking: Number,
    weight: Number,
    idCDT: Schema.ObjectId
});

var primaryServiceDescriptor = mongoose.model('primary_service', primaryServiceSchema);

module.exports = primaryServiceDescriptor;