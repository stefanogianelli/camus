'use strict';

let assert = require('assert');
let mockDatabase = require('./mockDatabaseCreator.js');
let MockDatabase = new mockDatabase();
let mockData = require('./mockModel.js');
let serviceManager = require('../components/primaryServiceSelection.js');
let ServiceManager = new serviceManager();
let queryHandler = require('../components/queryHandler.js');
let QueryHandler = new queryHandler();
let provider = require('../provider/provider.js');
let Provider = new provider();

let _idCDT;

describe('Component: QueryHandler', () => {

    before(function(done) {
        Provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase((err, idCDT) => {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#executeQueries()', () => {
        it('check if correct data are retrieved', () => {
            return ServiceManager
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(services => {
                    return QueryHandler.executeQueries(services, mockData.decoratedCdt(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'International Restaurant & Foodservice Show-New York');
                    assert.equal(responses[1][0].title, 'Bouley');
                });
        });
        it('check array composition when one service does not respond to a query', () => {
            return ServiceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(services => {
                    return QueryHandler.executeQueries(services, contextForFakeService(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'Bouley');
                    assert.equal(responses[1][0].title, 'International Restaurant & Foodservice Show-New York');
                });
        });
        it('check correct execution of custom bridge', () => {
            return ServiceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return QueryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 1);
                    assert.equal(responses[0][0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[0][1].title, 'Restaurant The Purple Pig');
                });
        });
    });

    after(done => {
        MockDatabase.deleteDatabase(err => {
            assert.equal(err, null);
            Provider.closeConnection();
            done();
        });
    });

});

//Context that involve the fake service
let contextForFakeService = idCDT => {
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
        parameterNodes: [
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'CityName',
                value: 'Milan'
            },
            {
                dimension: 'SearchKey',
                value: 'restaurantinnewyork'
            }
        ]
    }
};

//context for test the correct execution of custom bridge
let testBridgeContext = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'TestBridge',
                value: 'TestBridge'
            }
        ]
    }
};