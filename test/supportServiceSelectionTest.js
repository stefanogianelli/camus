'use strict';

let assert = require('assert');
let supportServiceSelection = require('../components/supportServiceSelection.js');
let SupportServiceSelection = new supportServiceSelection();
let mockData = require('./mockModel.js');
let mockDatabase = require('./mockDatabaseCreator.js');
let MockDatabase = new mockDatabase();
let provider = require('../provider/provider.js');
let Provider = new provider();

let _idCDT;

describe('Component: SupportServiceSelection', () => {

    before(function(done) {
        Provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase((err, idCDT) => {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#selectServices()', () => {
        it('check if correct services are selected', () => {
            return SupportServiceSelection
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(data => {
                    assert.equal(data.length, 3);
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={SearchKey}&prop=revisions&rvprop=content&format=json');
                    assert.equal(data[1].category, 'Transport');
                    assert.equal(data[1].service, 'ATM');
                    assert.equal(data[1].url, 'http://api.atm-mi.it/searchAddress?from={latitude|longitude}&to={latitude|longitude}&key=abc123');
                    assert.equal(data[2].category, 'Transport');
                    assert.equal(data[2].service, 'Trenord');
                    assert.equal(data[2].url, 'http://api.trenord.it/searchStation/fromStation/{startStationName}/toStation/{endStationName}');
                });
        });
        it('check response when no support service name is provided', () => {
            return SupportServiceSelection
                .selectServices(contextNoSupportName(_idCDT))
                .then(data => {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'ATAC');
                    assert.equal(data[0].url, 'http://api.atac.it/searchAddress?from={latitude|longitude}&to={latitude|longitude}&key=abc123');
                });
        });
        it('check response when no support category is provided', () => {
            return SupportServiceSelection
                .selectServices(contextNoSupportCategory(_idCDT))
                .then(data => {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={SearchKey}&prop=revisions&rvprop=content&format=json');
                });
        });
        it('check response when the specified service name does not exists', () => {
            return SupportServiceSelection
                .selectServices(contextWithInexistentName(_idCDT))
                .then(data => {
                    assert.equal(data.length, 0);
                });
        });
        it('check response when the support category does not exists', () => {
            return SupportServiceSelection
                .selectServices(contextWithInexistentCategory(_idCDT))
                .then(data => {
                    assert.equal(data.length, 0);
                });
        });
        it('check response when multiple service names are provided', () => {
            return SupportServiceSelection
                .selectServices(contextMultipleSupportServiceNames(_idCDT))
                .then(data => {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={SearchKey}&prop=revisions&rvprop=content&format=json');
                    assert.equal(data[1].name, 'Flickr');
                    assert.equal(data[1].url, 'http://api.flickr.com/photos/tag/{tag}');
                });
        });
        it('check response when multiple service categories are provided', () => {
            return SupportServiceSelection
                .selectServices(contextMultipleSupportServiceCategories(_idCDT))
                .then(data => {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'GoogleMaps');
                    assert.equal(data[0].url, 'https://maps.googleapis.com/maps/api/distancematrix/json?origins={startCity}&destinations={endCity}&mode=bus');
                    assert.equal(data[1].category, 'Photo');
                    assert.equal(data[1].service, 'Flickr');
                    assert.equal(data[1].url, 'http://api.flickr.com/photos/tag/{tag}');
                });
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(err => {
            assert.equal(err, null);
            Provider.closeConnection();
            done();
        });
    });
});

//context without service names
let contextNoSupportName = idCDT => {
    return {
        _id: idCDT,
        filterNodes: [
            {
                dimension: 'Transport',
                value: 'PublicTransport'
            },
            {
                dimension: 'Tipology',
                value: 'Bus'
            },
            {
                dimension: 'Tipology',
                value: 'Train'
            }
        ],
        parameterNodes: [
            {
                dimension: 'CityCoord',
                fields: [
                    {
                        name: 'Longitude',
                        value: '12.492118'
                    },
                    {
                        name: 'Latitude',
                        value: '41.889757'
                    }
                ]
            }
        ],
        specificNodes: [
            {
                dimension: 'CityCoord',
                fields: [
                    {
                        name: 'Longitude',
                        value: '12.492118'
                    },
                    {
                        name: 'Latitude',
                        value: '41.889757'
                    }
                ]
            }
        ],
        supportServiceCategories: [ 'Transport']
    }
};

//context without support categories
let contextNoSupportCategory = idCDT => {
    return {
        _id: idCDT,
        supportServiceNames: [
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};

//context with inexistent support category
let contextWithInexistentCategory = idCDT => {
    return {
        _id: idCDT,
        supportServiceCategories: [ 'Sport' ]
    }
};

//context with inexistent support service name
let contextWithInexistentName = idCDT => {
    return {
        _id: idCDT,
        supportServiceNames: [
            {
                name: 'Yahoo',
                operation: 'search'
            }
        ]
    }
};

//context with multiple support service names
let contextMultipleSupportServiceNames = idCDT => {
    return {
        _id: idCDT,
        supportServiceNames: [
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
let contextMultipleSupportServiceCategories = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'Transport',
                value: 'WithCar'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends'
            }
        ],
        supportServiceCategories: [ 'Transport', 'Photo' ]
    }
};