var assert = require('assert');
var MockDatabase = require('./mockDatabaseCreator.js');
var mockData = require('./mockModel.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var queryHandler = require('../components/queryHandler.js');
var provider = require('../provider/provider.js');

var _idCDT;

describe('Component: QueryHandler', function () {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase(function (err, idCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#executeQueries()', function () {
        it('check if correct data are retrieved', function () {
            return serviceManager
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, mockData.decoratedCdt(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 2);
                });
        });
        it('check array composition when one service does not respond to a query', function () {
            return serviceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, contextForFakeService(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 2);
                });
        });
        it('check correct execution of custom bridge', function () {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 1);
                });
        });
        it('check correct execution of custom function on attributes', function () {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 1);
                    assert.equal(responses[0][0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[0][1].title, 'Restaurant The Purple Pig');
                });
        });
        it('check error when an non existent translation function is called', function () {
            return serviceManager
                .selectServices(invalidTranslationFunction(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, invalidTranslationFunction(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, 'undefined');
                });
        });
        it('check error when a translation function receive an unrecognized parameter', function () {
            return serviceManager
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, invalidInterestTopic(_idCDT));
                })
                .then(function (responses) {
                    assert.notEqual(responses, 'undefined');
                });
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(function (err) {
            assert.equal(err, null);
            provider.closeConnection();
            done();
        });
    });

});

//Context that involve the fake service
var contextForFakeService = function (idCDT) {
    return {
        _id: _idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant',
                for: 'filter'
            },
            {
                dimension: 'City',
                value: 'Milan',
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
                dimension: "search_key",
                value: "restaurantinnewyork",
                for: "parameter"
            },
            {
                dimension: 'TestServizio',
                value: 'TestSenzaRisposta',
                for: 'filter'
            }
        ]
    }
};

//context for test the correct execution of custom bridge
var testBridgeContext = function (idCDT) {
    return {
        _id: _idCDT,
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
    }
};

//context for testing the behavior when non existent translation function is called
var invalidTranslationFunction = function (idCDT) {
    return {
        _id: _idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant',
                for: 'filter'
            },
            {
                dimension: "search_key",
                value: "restaurantinnewyork",
                for: "parameter"
            },
            {
                dimension: 'Budget',
                value: 'Low',
                for: 'filter|parameter',
                transformFunction: 'translateBudgets'
            }
        ]
    }
};

//context for testing the behavior when the translation function receive an unrecognized parameter
var invalidInterestTopic = function (idCDT) {
    return {
        _id: _idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Sport',
                for: 'filter'
            },
            {
                dimension: 'Budget',
                value: 'Low',
                for: 'filter|parameter',
                transformFunction: 'translateBudget'
            }
        ]
    }
};