var _ = require('lodash');
var async = require('async');
var assert = require('assert');
var mockData = require('./mockModel.js');
var ServiceModel = require('../models/ServiceDescriptor.js');
var PrimaryServiceModel = require('../models/primaryServiceDescriptor.js');

var _idCDT;

var mockDatabaseCreator = function (idCDT) {
    _idCDT = idCDT;
};

mockDatabaseCreator.prototype.createDatabase = function createDatabase (callback) {
    async.waterfall([
            function (callback) {
                var googlePlaces = new ServiceModel(mockData.googlePlaces);
                googlePlaces.save(function (err, service) {
                    callback(err, service.operations[0].id);
                });
            },
            function (idOperation, callback) {
                _.forEach(mockData.googlePlacesAssociations(idOperation, _idCDT), function (a) {
                    var associations = new PrimaryServiceModel(a);
                    associations.save(function (err) {
                        assert.equal(err, null);
                    });
                });
                callback(null, 'done');
            }
        ],
        function (err) {
            callback(err, 'done');
        });
};

mockDatabaseCreator.prototype.deleteDatabase = function deleteDatabase (callback) {
    async.parallel({
            one: function (callback) {
                PrimaryServiceModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            },
            two: function (callback) {
                ServiceModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            }
        },
        function (err) {
            callback(err, 'done');
        });
};

module.exports = mockDatabaseCreator;