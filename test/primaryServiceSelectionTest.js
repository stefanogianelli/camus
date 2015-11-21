var assert = require('assert');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var ServiceModel = require('../models/serviceDescription.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var mockData = require('./mockModel.js');
var MockDatabase = require('./mockDatabaseCreator.js');

Promise.promisifyAll(ServiceModel);

var db = mongoose.connection;
var _idCDT;

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err, idCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function() {
            return serviceManager
                .selectServices(mockData.context(_idCDT))
                .then(function(services) {
                    assert.notEqual(services, null);
                    assert.equal(services.length, 2);
                    assert.equal(services[0].rank, 6);
                    return [services, ServiceModel.findByOperationIdAsync(services[0]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                    assert.equal(services[1].rank, 1);
                    return ServiceModel.findByOperationIdAsync(services[1]._idOperation);
                })
                .then(function (data) {
                    assert.equal(data.name, 'eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
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
                .selectServices(mockData.parameterContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No filter nodes selected!');
                });
        });
        it('check error when no services found', function() {
            return serviceManager
                .selectServices(context2(_idCDT))
                .then(function (services) {
                    assert.equal(services.length, 0);
                })
                .catch(function (e) {
                    assert.equal(e, null);
                });
        });
        it('check correct execution when specified a wrong specific module name', function() {
            return serviceManager
                .selectServices(context1(_idCDT))
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

//contex with wrong search module name
var context1 = function (idCDT) {
    return {
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
    }
};

//contex with no associated services
var context2 = function (idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'SportType',
                value: 'Tennis',
                for: 'filter'
            }
        ]
    }
};