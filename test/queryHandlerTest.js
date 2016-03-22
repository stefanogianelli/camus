'use strict'

import assert from 'assert'

import MockDatabase from './mockDatabaseCreator'
import * as mockData from './mockModel'
import ServiceManager from '../src/components/primaryServiceSelection'
import QueryHandler from '../src/components/queryHandler'

const mockDatabase = new MockDatabase()
const serviceManager = new ServiceManager()
const queryHandler = new QueryHandler()

let _idCDT = null

describe('Component: QueryHandler', () => {

    before(function(done) {
        mockDatabase.createDatabase((err, idCDT) => {
            _idCDT = idCDT
            done(err)
        })
    })

    describe('#executeQueries()', () => {
        it('check if correct data are retrieved', () => {
            return serviceManager
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(services => {
                    return queryHandler.executeQueries(services, mockData.decoratedCdt(_idCDT))
                })
                .then(responses => {
                    assert.equal(responses.results.length, 30)
                    assert.equal(responses.results[0].title, 'Girl & the Goat')
                    assert.equal(responses.results[20].title, 'National Restaurant Association')
                })
        })
        it('check array composition when one service does not respond to a query', () => {
            return serviceManager
                .selectServices(contextForFakeService(_idCDT))
                .then(services => {
                    return queryHandler.executeQueries(services, contextForFakeService(_idCDT))
                })
                .then(responses => {
                    assert.equal(responses.results.length, 30)
                })
        })
        it('check correct execution of custom bridge', () => {
            return serviceManager
                .selectServices(testBridgeContext(_idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, testBridgeContext(_idCDT))
                })
                .then(responses => {
                    assert.equal(responses.results.length, 2)
                    assert.equal(responses.results[0].title, 'Restaurant Girl & the Goat')
                    assert.equal(responses.results[1].title, 'Restaurant The Purple Pig')
                })
        })
    })

    after(done => {
        mockDatabase.deleteDatabase(err => {
            done(err)
        })
    })

})

//Context that involve the fake service
const contextForFakeService = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                name: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                name: 'Budget',
                value: 'Low'
            },
            {
                name: 'Tipology',
                value: 'DinnerWithFriends'
            },
            {
                name: 'TestServizio',
                value: 'TestSenzaRisposta'
            }
        ],
        parameterNodes: [
            {
                name: 'Budget',
                value: 'Low'
            },
            {
                name: 'CityName',
                value: 'Milan'
            },
            {
                name: 'SearchKey',
                value: 'restaurantinnewyork'
            }
        ]
    }
}

//context for test the correct execution of custom bridge
const testBridgeContext = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                name: 'TestBridge',
                value: 'TestBridge'
            }
        ]
    }
}