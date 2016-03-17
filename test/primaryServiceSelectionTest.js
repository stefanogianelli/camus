'use strict'

import assert from 'assert'

import ServiceManager from '../src/components/primaryServiceSelection'
import MockDatabase from './mockDatabaseCreator'
import Provider from '../src/provider/provider'

const serviceManager = new ServiceManager()
const mockDatabase = new MockDatabase()
const provider = Provider.getInstance()

let _idCDT = null
let _idNestedCDT = null
let _idMultipleSonCDT = null

describe('Component: PrimaryServiceSelection', () => {

    before(function(done) {
        mockDatabase.createDatabase((err, idCDT, idNestedCDT, idMultipleSonCDT) => {
            _idCDT = idCDT
            _idNestedCDT = idNestedCDT
            _idMultipleSonCDT = idMultipleSonCDT
            done(err)
        })
    })

    describe('#selectServices()', () => {
        it('check if correct services are selected', () => {
            return serviceManager
                .selectServices(decoratedCdt(_idCDT))
                .then(services => {
                    assert.equal(services.length, 2)
                    assert.equal(services[0].rank, 4.5)
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(data.service.name, 'Eventful')
                    assert.equal(data.name, 'eventSearch')
                    assert.equal(services[1].rank, 1)
                    return provider.getServiceByOperationId(services[1]._idOperation)
                })
                .then(data => {
                    assert.equal(data.service.name, 'GooglePlaces')
                    assert.equal(data.name, 'placeTextSearch')
                })
        })
        it('check if correct services are selected for nested CDT dimensions', () => {
            return serviceManager
                .selectServices(nestedContext(_idNestedCDT))
                .then(services => {
                    assert.equal(services.length, 3)
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[0].rank, 1)
                    assert.equal(data.service.name, 'GooglePlaces')
                    assert.equal(data.name, 'placeTextSearch')
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[1].rank, 1)
                    assert.equal(data.service.name, 'Eventful')
                    assert.equal(data.name, 'eventSearch')
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[2].rank, 1)
                    assert.equal(data.service.name, 'fakeService')
                    assert.equal(data.name, 'eventSearch')
                })
        })
        it('check if correct services are selected for multiple son CDT dimensions', () => {
            return serviceManager
                .selectServices(multipleSonContext(_idMultipleSonCDT))
                .then(services => {
                    assert.equal(services.length, 3)
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[0].rank, 1)
                    assert.equal(data.service.name, 'GooglePlaces')
                    assert.equal(data.name, 'placeTextSearch')
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[1].rank, 1)
                    assert.equal(data.service.name, 'Eventful')
                    assert.equal(data.name, 'eventSearch')
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)]
                })
                .spread((services, data) => {
                    assert.equal(services[2].rank, 1)
                    assert.equal(data.service.name, 'fakeService')
                    assert.equal(data.name, 'eventSearch')
                })
        })
        it('check error when no filter nodes selected', () => {
            return serviceManager
                .selectServices(parameterContext(_idCDT))
                .catch(e => {
                    assert.equal(e.message, 'No filter nodes selected!')
                })
        })
    })

    after(done => {
        mockDatabase.deleteDatabase(err => {
            done(err)
        })
    })
})

//context with only parameter attribues
let parameterContext = idCDT => {
    return {
        _id: idCDT,
        parameterNodes: [
            {
                name: 'Number',
                value: '4'
            }
        ]
    }
}

//decorated context for test nested service selection
let nestedContext = idCDT => {
    return {
        _id: idCDT,
        filterNodes: [
            {
                name: 'a',
                value: 'b'
            },
            {
                name: 'd',
                value: 'e'
            },
            {
                name: 'd',
                value: 'f'
            },
            {
                name: 'g',
                value: 'h'
            },
            {
                name: 'g',
                value: 'i'
            }
        ]
    }
}

//decorated context for test multiple son service selection
let multipleSonContext = idCDT => {
    return {
        _id: idCDT,
        filterNodes: [
            {
                name: 'a',
                value: 'd'
            },
            {
                name: 'b',
                value: 'e'
            },
            {
                name: 'g',
                value: 'i'
            },
            {
                name: 'g',
                value: 'l'
            },
            {
                name: 'h',
                value: 'm'
            },
            {
                name: 'h',
                value: 'n'
            }
        ]
    }
}

//sample decorated CDT
let decoratedCdt = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                name: 'InterestTopic',
                value: 'Restaurant'
            }
        ],
        rankingNodes: [
            {
                name: 'Festivita',
                value: 'Capodanno'
            }
        ]
    }
}