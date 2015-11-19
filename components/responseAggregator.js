var _ = require('lodash');
var Promise = require('bluebird');

var responseAggregator = function () { };

responseAggregator.prototype.prepareResponse = function (responses, supportServices) {
    return new Promise (function (resolve, reject) {
        resolve(_.flatten(responses));
    });
};

module.exports = new responseAggregator();