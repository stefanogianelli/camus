'use strict';

import assert from 'assert';

import MockDatabase from './mockDatabaseCreator';
import * as mockData from './mockModel';
import ServiceManager from '../components/primaryServiceSelection';
import QueryHandler from '../components/queryHandler';
import Provider from '../provider/provider';

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
                    assert.equal(responses.length, 60);
                    assert.equal(responses[0].title, 'Girl & the Goat');
                    assert.equal(responses[20].title, 'Sapori Trattoria');
                    assert.equal(responses[40].title, 'National Restaurant Association');
                    assert.equal(responses[50].title, 'New Years Eve 2016 Party at Standard Bar and Grill Chicago NYE 2015');
                });
        });
        it('check array composition when one service does not respond to a query', () => {
            return serviceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(services => {
                    return queryHandler.executeQueries(services, contextForFakeService(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 30);
                });
        });
        it('check correct execution of custom bridge', () => {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT));
                })
                .then(responses => {
                    assert.equal(responses.length, 2);
                    assert.equal(responses[0].title, 'Restaurant Girl & the Goat');
                    assert.equal(responses[1].title, 'Restaurant The Purple Pig');
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