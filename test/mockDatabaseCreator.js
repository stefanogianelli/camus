var _ = require('lodash');
var async = require('async');
var assert = require('assert');
var mockData = require('./mockModel.js');
var ServiceModel = require('../models/serviceDescription.js');
var PrimaryServiceModel = require('../models/primaryServiceAssociation.js');

var _idCDT;

var mockDatabaseCreator = function (idCDT) {
    _idCDT = idCDT;
};

/**
 * Create a mock database for testing purposes
 * @param callback The callback function
 */
mockDatabaseCreator.prototype.createDatabase = function createDatabase (callback) {
    async.parallel({
        one: function (callback) {
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
        },
        two: function (callback) {
            async.waterfall([
                    function (callback) {
                        var eventful = new ServiceModel(mockData.eventful);
                        eventful.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.eventfulAssociations(idOperation, _idCDT), function (a) {
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
        }
    },
    function (err) {
        callback(err, 'done');
    });
};

/**
 * Delete the created database.
 * It must be called at the end of the tests
 * @param callback The callback function
 */
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