var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var primaryServiceSchema = new Schema ({
    idOperation: ObjectId,
    dimension: String,
    value: String,
    ranking: Number,
    weight: Number,
    idCDT: ObjectId
});

var primaryServiceDescriptor = mongoose.model('primaryService', primaryServiceSchema);

module.exports = primaryServiceDescriptor;