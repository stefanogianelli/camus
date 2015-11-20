var _ = require('lodash');
var async = require('async');
var assert = require('assert');
var mockData = require('./mockModel.js');
var ServiceModel = require('../models/serviceDescription.js');
var PrimaryServiceModel = require('../models/primaryServiceAssociation.js');
var SupportServiceModel = require('../models/supportServiceAssociation.js');

var mockDatabaseCreator = function (idCDT) {
    this._idCDT = idCDT;
};

/**
 * Create a mock database for testing purposes
 * @param callback The callback function
 */
mockDatabaseCreator.prototype.createDatabase = function createDatabase (callback) {
    var _idCDT = this._idCDT;
    var _idWikipedia;
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
        },
        three: function (callback) {
            async.waterfall([
                    function (callback) {
                        var fakeService = new ServiceModel(mockData.fakeService);
                        fakeService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.fakeServiceAssociation(idOperation, _idCDT), function (a) {
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
        four: function (callback) {
            async.waterfall([
                    function (callback) {
                        var testBridgeService = new ServiceModel(mockData.testBridge);
                        testBridgeService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.testBridgeAssociation(idOperation, _idCDT), function (a) {
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
        five: function (callback) {
            async.waterfall([
                    function (callback) {
                        var wikipediaService = new ServiceModel(mockData.wikipedia);
                        wikipediaService.save(function (err, service) {
                            _idWikipedia = service.operations[0].id;
                            callback(err, 'done');
                        });
                    }
                ],
                function (err) {
                    callback(err, 'done');
                });
        },
        six: function (callback) {
            async.waterfall([
                    function (callback) {
                        var googleMapsService = new ServiceModel(mockData.googleMaps);
                        googleMapsService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.googleMapsAssociation(idOperation, _idCDT), function (a) {
                            var associations = new SupportServiceModel(a);
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
        seven: function (callback) {
            async.waterfall([
                    function (callback) {
                        var atmService = new ServiceModel(mockData.atm);
                        atmService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.atmAssociation(idOperation, _idCDT), function (a) {
                            var associations = new SupportServiceModel(a);
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
        eight: function (callback) {
            async.waterfall([
                    function (callback) {
                        var atacService = new ServiceModel(mockData.atac);
                        atacService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.atacAssociation(idOperation, _idCDT), function (a) {
                            var associations = new SupportServiceModel(a);
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
        nine: function (callback) {
            async.waterfall([
                    function (callback) {
                        var fsService = new ServiceModel(mockData.fs);
                        fsService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.fsAssociation(idOperation, _idCDT), function (a) {
                            var associations = new SupportServiceModel(a);
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
        ten: function (callback) {
            async.waterfall([
                    function (callback) {
                        var trenordService = new ServiceModel(mockData.trenord);
                        trenordService.save(function (err, service) {
                            callback(err, service.operations[0].id);
                        });
                    },
                    function (idOperation, callback) {
                        _.forEach(mockData.trenordAssociation(idOperation, _idCDT), function (a) {
                            var associations = new SupportServiceModel(a);
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
        callback(err, mockData.context(_idCDT, _idWikipedia));
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