'use strict';

import assert from 'assert';

import ServiceManager from '../components/primaryServiceSelection.js';
import MockDatabase from './mockDatabaseCreator.js';
import Provider from '../provider/provider.js';

let serviceManager = new ServiceManager();
let mockDatabase = new MockDatabase();
let provider = new Provider();

let _idCDT;
let _idNestedCDT;
let _idMultipleSonCDT;

describe('Component: PrimaryServiceSelection', () => {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        mockDatabase.createDatabase((err, idCDT, idNestedCDT, idMultipleSonCDT) => {
            assert.equal(err, null);
            _idCDT = idCDT;
            _idNestedCDT = idNestedCDT;
            _idMultipleSonCDT = idMultipleSonCDT;
            done();
        });
    });

    describe('#selectServices()', () => {
        it('check if correct services are selected', () => {
            return serviceManager
                .selectServices(decoratedCdt(_idCDT))
                .then(services => {
                    assert.equal(services.length, 2);
                    assert.equal(services[0].rank, 5);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    assert.equal(services[1].rank, 2);
                    return provider.getServiceByOperationId(services[1]._idOperation);
                })
                .then(data => {
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                });
        });
        it('check if correct services are selected for nested CDT dimensions', () => {
            return serviceManager
                .selectServices(nestedContext(_idNestedCDT))
                .then(services => {
                    assert.equal(services.length, 3);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[0].rank, 2);
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[1].rank, 2);
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[2].rank, 2);
                    assert.equal(data.name, 'fakeService');
                    assert.equal(data.operations[0].name, 'eventSearch');
                });
        });
        it('check if correct services are selected for multiple son CDT dimensions', () => {
            return serviceManager
                .selectServices(multipleSonContext(_idMultipleSonCDT))
                .then(services => {
                    assert.equal(services.length, 3);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[0].rank, 2);
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[1].rank, 2);
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)];
                })
                .spread((services, data) => {
                    assert.equal(services[2].rank, 2);
                    assert.equal(data.name, 'fakeService');
                    assert.equal(data.operations[0].name, 'eventSearch');
                });
        });
        it('check error when no filter nodes selected', () => {
            return serviceManager
                .selectServices(parameterContext(_idCDT))
                .catch(e => {
                    assert.equal(e.message, 'No filter nodes selected!');
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

//context with only parameter attribues
let parameterContext = idCDT => {
    return {
        _id: idCDT,
        parameterNodes: [
            {
                dimension: 'Number',
                value: '4'
            }
        ]
    }
};

//decorated context for test nested service selection
let nestedContext = idCDT => {
    return {
        _id: idCDT,
        filterNodes: [
            {
                dimension: 'a',
                value: 'b'
            },
            {
                dimension: 'd',
                value: 'e'
            },
            {
                dimension: 'd',
                value: 'f'
            },
            {
                dimension: 'g',
                value: 'h'
            },
            {
                dimension: 'g',
                value: 'i'
            }
        ]
    };
};

//decorated context for test multiple son service selection
let multipleSonContext = idCDT => {
    return {
        _id: idCDT,
        filterNodes: [
            {
                dimension: 'a',
                value: 'd'
            },
            {
                dimension: 'b',
                value: 'e'
            },
            {
                dimension: 'g',
                value: 'i'
            },
            {
                dimension: 'g',
                value: 'l'
            },
            {
                dimension: 'h',
                value: 'm'
            },
            {
                dimension: 'h',
                value: 'n'
            }
        ]
    };
};

//sample decorated CDT
let decoratedCdt = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            }
        ],
        rankingNodes: [
            {
                dimension: 'Festivita',
                value: 'Capodanno'
            }
        ]
    }
};
