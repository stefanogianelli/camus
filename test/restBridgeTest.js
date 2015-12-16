'use strict';

import assert from 'assert';

import RestBridge from '../bridges/restBridge.js';
import * as mockModel from './mockModel.js';

let restBridge = new RestBridge();

describe('Component: RestBridge', () => {

    describe('#executeQuery()', () => {
        it('check that correct response is returned', () => {
            return restBridge
                .executeQuery(mockModel.eventful, mockModel.decoratedCdt(1).parameterNodes)
                .then(data => {
                    assert.notEqual(data, null);
                    assert.equal(data.total_items, 134);
                });
        });
        it('check error when a required default parameter is not defined', () => {
            return restBridge
                .executeQuery(noDefaultParameterService, mockModel.decoratedCdt(1).parameterNodes)
                .catch(e => {
                    assert.equal(e, 'lack of required parameter \'app_key\'');
                });
        });
        it('check error when a required parameter has no value in the CDT', () => {
            return restBridge
                .executeQuery(noValueParameterService, mockModel.decoratedCdt(1).parameterNodes)
                .catch(e => {
                    assert.equal(e, 'lack of required parameter \'location\'');
                });
        });
        it('check error when the service does not respond', () => {
            return restBridge
                .executeQuery(wrongBasePath, mockModel.decoratedCdt(1).parameterNodes)
                .catch(e => {
                    assert.notEqual(e, null);
                });
        });
    });

    describe('#searchMapping()', () => {
        it('check if simple attribute are correctly handled', () => {
            let value = restBridge._searchMapping(simpleParameters, 'CityName');
            assert.equal(value, 'Milan');
        });
        it('check if composite attributes are correctly handled', () => {
            let latitude = restBridge._searchMapping(compositeParameters, 'CityCoord.Latitude');
            assert.equal(latitude, 45.478906);
            let longitude = restBridge._searchMapping(compositeParameters, 'CityCoord.Longitude');
            assert.equal(longitude, 9.234297);
        });
        it('check value if a non valid mapping is provided', () => {
            let value =  restBridge._searchMapping(simpleParameters, 'Budget');
            assert.equal(typeof value, 'undefined');
        });
        it('check value if dot notation mapping is provided but the object doesn\'t have fields', () => {
            let value =  restBridge._searchMapping(simpleParameters, 'Budget.Name');
            assert.equal(typeof value, 'undefined');
        });
    });

});

let noDefaultParameterService = {
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
                        'SearchKey'
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

let noValueParameterService = {
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
                        'SearchKey'
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

let wrongBasePath = {
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
                        'SearchKey'
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

let simpleParameters = [
    {
        dimension: 'CityName',
        value: 'Milan'
    }
];

let compositeParameters = [
    {
        dimension: 'CityCoord',
        fields: [
            {
                name: 'Longitude',
                value: '9.234297'
            },
            {
                name: 'Latitude',
                value: '45.478906'
            }
        ]
    }
];