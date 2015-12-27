'use strict';

import assert from 'assert';

import RestBridge from '../bridges/restBridge';
import * as mockModel from './mockModel';

const restBridge = new RestBridge();

describe('Component: RestBridge', () => {

    describe('#executeQuery()', () => {
        it('check that correct response is returned', () => {
            return restBridge
                .executeQuery(eventful, mockModel.decoratedCdt(1).parameterNodes)
                .then(data => {
                    assert.notEqual(data, null);
                    assert.equal(data[0].total_items, 83);
                });
        });
        it('check that correct response is returned when request multiple pages', () => {
            const paginationArgs = {
                numOfPages: 2
            };
            return restBridge
                .executeQuery(eventful, mockModel.decoratedCdt(1).parameterNodes, paginationArgs)
                .then(data => {
                    assert.equal(data.length, 2);
                    assert.equal(data[0].page_number, 1);
                    assert.equal(data[1].page_number, 2);
                });
        });
        it('check that correct response is returned when request multiple pages, starting from the second to last page', () => {
            const paginationArgs = {
                startPage: 2,
                numOfPages: 2
            };
            return restBridge
                .executeQuery(eventful, mockModel.decoratedCdt(1).parameterNodes, paginationArgs)
                .then(data => {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].page_number, 2);
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
            const value = restBridge._searchMapping(simpleParameters, 'CityName');
            assert.equal(value, 'Milan');
        });
        it('check if composite attributes are correctly handled', () => {
            const latitude = restBridge._searchMapping(compositeParameters, 'CityCoord.Latitude');
            assert.equal(latitude, 45.478906);
            const longitude = restBridge._searchMapping(compositeParameters, 'CityCoord.Longitude');
            assert.equal(longitude, 9.234297);
        });
        it('check value if a non valid mapping is provided', () => {
            const value =  restBridge._searchMapping(simpleParameters, 'Budget');
            assert.equal(typeof value, 'undefined');
        });
        it('check value if dot notation mapping is provided but the object doesn\'t have fields', () => {
            const value =  restBridge._searchMapping(simpleParameters, 'Budget.Name');
            assert.equal(typeof value, 'undefined');
        });
    });

});

const eventful = {
    name: 'Eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json',
    operations: {
        name: 'eventSearch',
        path: '/events/search',
        parameters: [
            {
                name: 'app_key',
                required: true,
                default: 'cpxgqQcFnbVSmvc2'
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
                    'CityName'
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
                    termName: 'address',
                    path: 'venue_address'
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
        },
        pagination: {
            attributeName: 'page_number',
            type: 'number',
            pageCountAttribute: 'page_count',
            delay: 0
        }
    }
};

const noDefaultParameterService = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json',
    operations: {
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
};

const noValueParameterService = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json',
    operations: {
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
};

const wrongBasePath = {
    name: 'eventful',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000',
    operations: {
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
};

const simpleParameters = [
    {
        dimension: 'CityName',
        value: 'Milan'
    }
];

const compositeParameters = [
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