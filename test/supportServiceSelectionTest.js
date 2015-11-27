var assert = require('assert');
var supportServiceSelection = require('../components/supportServiceSelection.js');
var mockData = require('./mockModel.js');
var MockDatabase = require('./mockDatabaseCreator.js');
var provider = require('../provider/provider.js');

var _idCDT;

describe('Component: SupportServiceSelection', function () {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase(function (err, idCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#selectServices()', function () {
        it('check if correct services are selected', function () {
            return supportServiceSelection
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 3);
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[1].category, 'Transport');
                    assert.equal(data[1].service, 'ATM');
                    assert.equal(data[2].category, 'Transport');
                    assert.equal(data[2].service, 'Trenord');
                });
        });
        it('check response when no support service name is provided', function () {
            return supportServiceSelection
                .selectServices(contextNoSupportName(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'ATM');
                    assert.equal(data[1].category, 'Transport');
                    assert.equal(data[1].service, 'Trenord');
                });
        });
        it('check response when no support category is provided', function () {
            return supportServiceSelection
                .selectServices(contextNoSupportCategory(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'Wikipedia');
                });
        });
        it('check response when the support category has no constraint', function () {
            return supportServiceSelection
                .selectServices(contextUnconstrainedCategory(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'GoogleMaps');
                });
        });
        it('check response when the specified service name does not exists', function () {
            return supportServiceSelection
                .selectServices(contextWithInexistentName(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 0);
                });
        });
        it('check response when the support category does not exists', function () {
            return supportServiceSelection
                .selectServices(contextWithInexistentCategory(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 0);
                });
        });
        it('check response when multiple service names are provided', function () {
            return supportServiceSelection
                .selectServices(contextMultipleSupportServiceNames(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].name, 'Flickr');
                    assert.equal(data[1].name, 'Wikipedia');
                });
        });
        it('check response when multiple service categories are provided', function () {
            return supportServiceSelection
                .selectServices(contextMultipleSupportServiceCategories(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'GoogleMaps');
                    assert.equal(data[1].category, 'Photo');
                    assert.equal(data[1].service, 'Flickr');
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

//context without service names
var contextNoSupportName = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                for: 'filter',
                params: [
                    {
                        name: 'City',
                        value: 'Milan'
                    }
                ]
            },
            {
                "dimension": 'Transport',
                "value": 'PublicTransport',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                category: 'Transport'
            }
        ]
    }
};

//context without support categories
var contextNoSupportCategory = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'PublicTransport',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};

//context with unconstrained support category
var contextUnconstrainedCategory = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'WithCar',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                category: 'Transport'
            }
        ]
    }
};

//context with inexistent support category
var contextWithInexistentCategory = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'WithCar',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                category: 'Sport'
            }
        ]
    }
};

//context with inexistent support service name
var contextWithInexistentName = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'WithCar',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                name: 'Yahoo'
            }
        ]
    }
};

//context with multiple support service names
var contextMultipleSupportServiceNames = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'WithCar',
                "supportCategory": 'Transport',
                "for": 'filter'
            }
        ],
        support: [
            {
                name: 'Wikipedia',
                operation: 'search'
            },
            {
                name: 'Flickr',
                operation: 'searchPhoto'
            }
        ]
    }
};

//context with multiple support service categories
var contextMultipleSupportServiceCategories = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'Milan',
                for: 'filter'
            },
            {
                "dimension": 'Transport',
                "value": 'WithCar',
                "supportCategory": 'Transport',
                "for": 'filter'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends',
                for: 'filter',
                supportCategory: 'Photo'
            }
        ],
        support: [
            {
                category: 'Transport'
            },
            {
                category: 'Photo'
            }
        ]
    }
};