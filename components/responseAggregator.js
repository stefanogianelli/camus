var _ = require('lodash');
var Promise = require('bluebird');

var responseAggregator = function () { };

responseAggregator.prototype.prepareResponse = function (responses, supportServices) {
    return new Promise (function (resolve, reject) {
        var response = {};
        response['data'] = _.flatten(responses);
        response['support'] = [];
        resolve(response);
    });
};

module.exports = new responseAggregator();