var assert = require('assert');
var serviceManager = require('../components/primaryServiceSelection.js');
var MockDatabase = require('./mockDatabaseCreator.js');
var provider = require('../provider/provider.js');

var _idCDT;
var _idNestedCDT;
var _idMultipleSonCDT;

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase(function (err, idCDT, idNestedCDT, idMultipleSonCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            _idNestedCDT = idNestedCDT;
            _idMultipleSonCDT = idMultipleSonCDT;
            done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function() {
            return serviceManager
                .selectServices(decoratedCdt(_idCDT))
                .then(function(services) {
                    assert.equal(services.length, 2);
                    assert.equal(services[0].rank, 5);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    assert.equal(services[1].rank, 2);
                    return provider.getServiceByOperationId(services[1]._idOperation);
                })
                .then(function (data) {
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                });
        });
        it('check if correct services are selected for nested CDT dimensions', function() {
            return serviceManager
                .selectServices(nestedContext(_idNestedCDT))
                .then(function(services) {
                    assert.equal(services.length, 3);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[0].rank, 2);
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[1].rank, 2);
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[2].rank, 2);
                    assert.equal(data.name, 'fakeService');
                    assert.equal(data.operations[0].name, 'eventSearch');
                });
        });
        it('check if correct services are selected for multiple son CDT dimensions', function() {
            return serviceManager
                .selectServices(multipleSonContext(_idMultipleSonCDT))
                .then(function(services) {
                    assert.equal(services.length, 3);
                    return [services, provider.getServiceByOperationId(services[0]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[0].rank, 2);
                    assert.equal(data.name, 'GooglePlaces');
                    assert.equal(data.operations[0].name, 'placeTextSearch');
                    return [services, provider.getServiceByOperationId(services[1]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[1].rank, 2);
                    assert.equal(data.name, 'Eventful');
                    assert.equal(data.operations[0].name, 'eventSearch');
                    return [services, provider.getServiceByOperationId(services[2]._idOperation)];
                })
                .spread(function (services, data) {
                    assert.equal(services[2].rank, 2);
                    assert.equal(data.name, 'fakeService');
                    assert.equal(data.operations[0].name, 'eventSearch');
                });
        });
        it('check error when no filter nodes selected', function() {
            return serviceManager
                .selectServices(parameterContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e.message, 'No filter nodes selected!');
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

//context with only parameter attribues
var parameterContext = function(idCDT) {
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
var nestedContext = function (idCDT) {
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
var multipleSonContext = function (idCDT) {
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
var decoratedCdt = function (idCDT) {
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
