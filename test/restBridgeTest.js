var assert = require('assert');
var restBridge = require('../bridges/restBridge.js');
var mockModel = require('./mockModel.js');

describe('Component: RestBridge', function () {

    describe('#executeQuery()', function () {
        it('check that correct response is returned', function () {
            return restBridge
                .executeQuery(mockModel.eventful, mockModel.decoratedCdt(1).parameterNodes)
                .then(function (data) {
                    assert.notEqual(data, null);
                    assert.equal(data.total_items, 134);
                });
        });
        it('check error when a required default parameter is not defined', function () {
            return restBridge
                .executeQuery(noDefaultParameterService, mockModel.decoratedCdt(1).parameterNodes)
                .catch(function (e) {
                    assert.equal(e, 'lack of required parameter \'app_key\'');
                });
        });
        it('check error when a required parameter has no value in the CDT', function () {
            return restBridge
                .executeQuery(noValueParameterService, mockModel.decoratedCdt(1).parameterNodes)
                .catch(function (e) {
                    assert.equal(e, 'lack of required parameter \'location\'');
                });
        });
        it('check error when the service does not respond', function () {
            return restBridge
                .executeQuery(wrongBasePath, mockModel.decoratedCdt(1).parameterNodes)
                .catch(function (e) {
                    assert.notEqual(e, null);
                });
        });
    });

});

var noDefaultParameterService = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json',
    operations: [
        {
            name: 'eventSearch',
            path: '/events/search',
            parameters: [
                {
                    name: 'app_key',
                    required: true,
                    mappingCDT: []
                },
                {
                    name: 'keywords',
                    required: false,
                    default: 'restaurant',
                    mappingCDT: [
                        'search_key'
                    ]
                },
                {
                    name: 'location',
                    required: false,
                    default: 'chicago',
                    mappingCDT: [
                        'Location'
                    ]
                }
            ],
            responseMapping: {
                list: 'events.event',
                items: [
                    {
                        termName: 'title',
                        path: 'title'
                    },
                    {
                        termName: 'venue_address',
                        path: 'address'
                    },
                    {
                        termName: 'latitude',
                        path: 'latitude'
                    },
                    {
                        termName: 'longitude',
                        path: 'longitude'
                    }
                ]
            }
        }
    ]
};

var noValueParameterService = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json',
    operations: [
        {
            name: 'eventSearch',
            path: '/events/search',
            parameters: [
                {
                    name: 'app_key',
                    required: true,
                    default: 'cpxgqQcFnbVSmvc2',
                    mappingCDT: []
                },
                {
                    name: 'keywords',
                    required: false,
                    default: 'restaurant',
                    mappingCDT: [
                        'search_key'
                    ]
                },
                {
                    name: 'location',
                    required: true,
                    default: 'chicago',
                    mappingCDT: [
                        'location'
                    ]
                }
            ],
            responseMapping: {
                list: 'events.event',
                items: [
                    {
                        termName: 'title',
                        path: 'title'
                    },
                    {
                        termName: 'venue_address',
                        path: 'address'
                    },
                    {
                        termName: 'latitude',
                        path: 'latitude'
                    },
                    {
                        termName: 'longitude',
                        path: 'longitude'
                    }
                ]
            }
        }
    ]
};

var wrongBasePath = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000',
    operations: [
        {
            name: 'eventSearch',
            path: '/events/search',
            parameters: [
                {
                    name: 'app_key',
                    required: true,
                    default: 'cpxgqQcFnbVSmvc2',
                    mappingCDT: []
                },
                {
                    name: 'keywords',
                    required: false,
                    default: 'restaurant',
                    mappingCDT: [
                        'search_key'
                    ]
                },
                {
                    name: 'location',
                    required: false,
                    default: 'chicago',
                    mappingCDT: [
                        'Location'
                    ]
                }
            ],
            responseMapping: {
                list: 'events.event',
                items: [
                    {
                        termName: 'title',
                        path: 'title'
                    },
                    {
                        termName: 'venue_address',
                        path: 'address'
                    },
                    {
                        termName: 'latitude',
                        path: 'latitude'
                    },
                    {
                        termName: 'longitude',
                        path: 'longitude'
                    }
                ]
            }
        }
    ]
};