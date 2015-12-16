'use strict';

import assert from 'assert';

import MockDatabase from './mockDatabaseCreator.js';
import * as mockData from './mockModel.js';
import ServiceManager from '../components/primaryServiceSelection.js';
import QueryHandler from '../components/queryHandler.js';
import Provider from '../provider/provider.js';

const mockDatabase = new MockDatabase();
const serviceManager = new ServiceManager();
const queryHandler = new QueryHandler();
const provider = new Provider();

let _idCDT;

describe('Component: QueryHandler', () => {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        mockDatabase.createDatabase((err, idCDT) => {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#executeQueries()', () => {
        it('check if correct data are retrieved', () => {
            return serviceManager
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(services => {
                    return queryHandler.executeQueries(services, mockData.decoratedCdt(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'Bouley');
                    assert.equal(responses[1][0].title, 'International Restaurant & Foodservice Show-New York');
                });
        });
        it('check array composition when one service does not respond to a query', () => {
            return serviceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(services => {
                    return queryHandler.executeQueries(services, contextForFakeService(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0][0].title, 'Bouley');
                    assert.equal(responses[1][0].title, 'International Restaurant & Foodservice Show-New York');
                });
        });
        it('check correct execution of custom bridge', () => {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 1);
                    assert.equal(responses[0][0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[0][1].title, 'Restaurant The Purple Pig');
                });
        });
    });

    after(done => {
        mockDatabase.deleteDatabase(err => {
            assert.equal(err, null);
            provider.closeConnection();
            done();
        });
    });

});

//Context that involve the fake service
const contextForFakeService = idCDT => {
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
const testBridgeContext = idCDT => {
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