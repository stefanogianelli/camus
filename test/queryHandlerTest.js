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
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'Bouley');
                    assert.equal(responses[1][0].title, 'International Restaurant & Foodservice Show-New York');
                });
        });
        it('check array composition when one service does not respond to a query', function () {
            return serviceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, contextForFakeService(_idCDT));
                })
                .then(function (responses) {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'Bouley');
                    assert.equal(responses[1][0].title, 'International Restaurant & Foodservice Show-New York');
                });
        });
        it('check correct execution of custom bridge', function () {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(function (responses) {
                    assert.equal(responses.length, 1);
                    assert.equal(responses[0][0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[0][1].title, 'Restaurant The Purple Pig');
                });
        });
        it('check if a parameter is correctly translated', function () {
            return queryHandler
                ._translateParameters(translateTestCdt.parameterNodes, translateTestCdt)
                .then(function (params) {
                    assert.equal(params[0].value, 10);
                })
        });
        it('check error when an non existent translation function is called', function () {
            return queryHandler
                ._translateParameters(invalidTranslationCdt.parameterNodes, invalidTranslationCdt)
                .then(function (params) {
                    assert.equal(params[0].value, 'Low');
                })
        });
        it('check error when a translation function receive an unrecognized parameter', function () {
            return queryHandler
                ._translateParameters(invalidTranslationInterestTopicCdt.parameterNodes, invalidTranslationInterestTopicCdt)
                .then(function (params) {
                    assert.equal(params[0].value, 'Low');
                })
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
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends'
            },
            {
                dimension: 'TestServizio',
                value: 'TestSenzaRisposta'
            }
        ],
        specificNodes: [],
        parameterNodes: [
            {
                dimension: 'Budget',
                value: 'Low',
                transformFunction: 'translateBudget'
            },
            {
                dimension: 'City',
                value: 'Milan'
            },
            {
                dimension: 'Number',
                value: '4'
            },
            {
                dimension: 'search_key',
                value: 'restaurantinnewyork'
            }
        ]
    }
};

//context for test the correct execution of custom bridge
var testBridgeContext = function (idCDT) {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'TestBridge',
                value: 'TestBridge'
            }
        ],
        specificNodes: [],
        parameterNodes: []
    }
};

var translateTestCdt = {
    interestTopic: 'Restaurant',
    parameterNodes: [
        {
            dimension: 'Budget',
            value: 'Low',
            transformFunction: 'translateBudget'
        }
    ]
};

var invalidTranslationCdt = {
    interestTopic: 'Restaurant',
    parameterNodes: [
        {
            dimension: 'Budget',
            value: 'Low',
            transformFunction: 'translateBudgets'
        }
    ]
};

var invalidTranslationInterestTopicCdt = {
    interestTopic: 'Sport',
    parameterNodes: [
        {
            dimension: 'Budget',
            value: 'Low',
            transformFunction: 'translateBudget'
        }
    ]
};