var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var serviceDescriptorSchema = new Schema({
    name: String,
    description: String,
    type: String,
    protocol: String,
    category: String,
    basePath: String,
    operations: [
        {
            name: String,
            description: String,
            path: String,
            bridgeName: String,
            parameters: [
                {
                    name: String,
                    description: String,
                    required: Boolean,
                    type: String,
                    default: String,
                    mappingCDT: String,
                    mappingTerm: String,
                    transformFunction: String
                }
            ],
            headers: [
                {
                    name: String,
                    value: String
                }
            ],
            responseMapping: [
                {
                    list: String,
                    item: [
                        {
                            termName: String,
                            path: String
                        }
                    ],
                    operate: [
                        {
                            run: String,
                            on: String
                        }
                    ]
                }
            ]
        }
    ]
});

var serviceDescriptor = mongoose.model('serviceDescriptor', serviceDescriptorSchema);

module.exports = serviceDescriptor;