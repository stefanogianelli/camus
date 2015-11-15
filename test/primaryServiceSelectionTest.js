var assert = require('assert');
var mongoose = require('mongoose');
var async = require('async');
var ServiceModel = require('../models/serviceDescription.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var mockData = require('./mockModel.js');
var mockDatabase = require('./mockDatabaseCreator.js');

var db = mongoose.connection;
var idCDT = new mongoose.Types.ObjectId();
var MockDatabase = new mockDatabase(idCDT);

//contex with wrong search module name
var context1 = {
    _id: idCDT,
    context: [
        {
            dimension: 'InterestTopic',
            value: 'Restaurant',
            for: 'filter'
        },
        {
            dimension: 'Location',
            value: 'Milan',
            for: 'filter|parameter',
            search: 'wrongName'
        },
        {
            dimension: 'Guests',
            value: '4',
            for: 'parameter'
        },
        {
            dimension: 'Budget',
            value: 'Low',
            for: 'filter|parameter'
        },
        {
            dimension: 'Tipology',
            value: 'DinnerWithFriends',
            for: 'filter'
        }
    ]
};

//contex with no associated services
var context2 = {
    _id: idCDT,
    context: [
        {
            dimension: 'SportType',
            value: 'Tennis',
            for: 'filter'
        }
    ]
};

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function(done) {
            serviceManager
                .selectServices(mockData.context(idCDT))
                .then(function(services) {
                    assert.notEqual(services, null);
                    assert.equal(services.length, 2);
                    async.parallel({
                        one: function (callback) {
                            assert.equal(services[0].rank, 6);
                            ServiceModel.findByOperationId(services[0]._idOperation, function (err, data) {
                                assert.equal(err, null);
                                assert.equal(data.name, 'GooglePlaces');
                                assert.equal(data.operations[0].name, 'placeTextSearch');
                                callback(null, 'done');
                            });
                        },
                        two: function (callback) {
                            assert.equal(services[1].rank, 1);
                            ServiceModel.findByOperationId(services[1]._idOperation, function (err, data) {
                                assert.equal(err, null);
                                assert.equal(data.name, 'eventful');
                                assert.equal(data.operations[0].name, 'eventSearch');
                                callback(null, 'done');
                            });
                        }
                    },
                    function (err) {
                        assert.equal(err, null);
                        done();
                    });
                })
                .catch(function (e) {
                    console.log(e);
                    done();
                });
        });
        it('check error when no context selected', function() {
            return serviceManager
                .selectServices({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when no filter nodes selected', function() {
            return serviceManager
                .selectServices(mockData.parameterContext(idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No filter nodes selected!');
                });
        });
        it('check error when no services found', function() {
            return serviceManager
                .selectServices(context2)
                .then(function (services) {
                    assert.equal(services.length, 0);
                })
                .catch(function (e) {
                    assert.equal(e, null);
                });
        });
        it('check correct execution when specified a wrong specific module name', function() {
            return serviceManager
                .selectServices(context1)
                .then(function(services) {
                    assert.equal(services[0].rank, 4);
                    assert.equal(services[1].rank, 1);
                })
                .catch(function (e) {
                    assert.equal(e, null);
                });
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(function (err) {
            assert.equal(err, null);
            done();
        });
    });
});