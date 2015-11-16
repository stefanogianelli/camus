var Promise = require('bluebird');

var restBridge = function () { };

restBridge.prototype.executeQuery = function (service, params) {
    return new Promise (function (resolve, reject) {

    });
};

module.exports = new restBridge();