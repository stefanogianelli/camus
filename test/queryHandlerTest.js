var mongoose = require('mongoose');
var assert = require('assert');
var mockDatabase = require('./mockDatabaseCreator.js');
var mockData = require('./mockModel.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var queryHandler = require('../components/queryHandler.js');

var db = mongoose.connection;
var idCDT = new mongoose.Types.ObjectId();
var MockDatabase = new mockDatabase(idCDT);

describe('Component: QueryHandler', function () {

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

    describe('#executeQueries()', function () {
        it('check if correct data are retrieved', function () {
            return serviceManager
                .selectServices(mockData.context(idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, mockData.context(idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 2);
                });
        });
        it('check array composition when one service does not respond to a query', function () {
            return serviceManager
                .selectServices(contextForFakeService)
                .then(function(services) {
                    return queryHandler.executeQueries(services, contextForFakeService);
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 2);
                });
        });
        it('check correct execution of custom bridge', function () {
            return serviceManager
                .selectServices(testBridgeContext)
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext);
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 1);
                });
        });
        it('check correct execution of custom function on attributes', function () {
            return serviceManager
                .selectServices(testBridgeContext)
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext);
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 1);
                    assert.equal(responses[0][0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[0][1].title, 'Restaurant The Purple Pig');
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

//Context that involve the fake service
var contextForFakeService = {
    _id: idCDT,
    context: [
        {
            dimension: 'InterestTopic',
            value: 'Restaurant',
            for: 'filter'
        },
        {
            dimension: 'Location',
            value: 'newyork',
            for: 'filter|parameter',
            search: 'testCustomSearch'
        },
        {
            dimension: 'Guests',
            value: '4',
            for: 'parameter'
        },
        {
            dimension: 'Budget',
            value: 'Low',
            for: 'filter|parameter',
            transformFunction: 'translateBudget'
        },
        {
            dimension: 'Tipology',
            value: 'DinnerWithFriends',
            for: 'filter'
        },
        {
            dimension : "search_key",
            value : "restaurantinnewyork",
            for : "parameter"
        },
        {
            dimension: 'TestServizio',
            value: 'TestSenzaRisposta',
            for: 'filter'
        }
    ]
};

var testBridgeContext = {
    _id: idCDT,
    context: [
        {
            dimension: 'InterestTopic',
            value: 'Bridge',
            for: 'filter'
        },
        {
            dimension: 'TestBridge',
            value: 'TestBridge',
            for: 'filter'
        }
    ]
};