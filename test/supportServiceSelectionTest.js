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
                    assert.equal(data.length, 5);
                    /*assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={search_key}&prop=revisions&rvprop=content&format=json');
                    assert.equal(data[1].category, 'Transport');
                    assert.equal(data[1].service, 'ATM');
                    assert.equal(data[1].url, 'http://api.atm-mi.it/searchAddress?from={latitude|longitude}&to={latitude|longitude}&key=abc123');
                    assert.equal(data[2].category, 'Transport');
                    assert.equal(data[2].service, 'Trenord');
                    assert.equal(data[2].url, 'http://api.trenord.it/searchStation/fromStation/{startStationName}/toStation/{endStationName}');*/
                });
        });
        it('check response when no support service name is provided', function () {
            return supportServiceSelection
                .selectServices(contextNoSupportName(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 4);
                    /*assert.equal(data[0].category, 'Transport');
                    assert.equal(data[0].service, 'ATM');
                    assert.equal(data[0].url, 'http://api.atm-mi.it/searchAddress?from={latitude|longitude}&to={latitude|longitude}&key=abc123');
                    assert.equal(data[1].category, 'Transport');
                    assert.equal(data[1].service, 'Trenord');
                    assert.equal(data[1].url, 'http://api.trenord.it/searchStation/fromStation/{startStationName}/toStation/{endStationName}');*/
                });
        });
        it('check response when no support category is provided', function () {
            return supportServiceSelection
                .selectServices(contextNoSupportCategory(_idCDT))
                .then(function (data) {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={search_key}&prop=revisions&rvprop=content&format=json');
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
                    assert.equal(data[0].name, 'Wikipedia');
                    assert.equal(data[0].url, 'https://en.wikipedia.org/w/api.php?action=query&titles={search_key}&prop=revisions&rvprop=content&format=json');
                    assert.equal(data[1].name, 'Flickr');
                    assert.equal(data[1].url, 'http://api.flickr.com/photos/tag/{tag}');
                });
        });
        it('check response when multiple service categories are provided', function () {
            return supportServiceSelection
                .selectServices(contextMultipleSupportServiceCategories(_idCDT))
                .then(function (data) {
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
                dimension: 'City',
                value: 'Milan'
            }
        ],
        supportServiceCategories: [ 'Transport']
    }
};

//context without support categories
var contextNoSupportCategory = function(idCDT) {
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
var contextWithInexistentCategory = function(idCDT) {
    return {
        _id: idCDT,
        supportServiceCategories: [ 'Sport' ]
    }
};

//context with inexistent support service name
var contextWithInexistentName = function(idCDT) {
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
var contextMultipleSupportServiceNames = function(idCDT) {
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
var contextMultipleSupportServiceCategories = function(idCDT) {
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