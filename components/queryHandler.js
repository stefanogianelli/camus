var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');
var ServiceModel = require('../models/serviceDescription.js');

var queryHandler = function () { };

queryHandler.prototype.executeQueries = function executeQueries (services) {
    return new Promise(function (resolve, reject) {
        async.forEachOf(services, function (s, index, callback) {
            console.log(index);
            console.log(s);
            callback();
        },
        function () {
            console.log('All done');
            resolve();
        });
    });
};

module.exports = new queryHandler();