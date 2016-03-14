'use strict'

import assert from 'assert'

import RestBridge from '../src/bridges/restBridge'
import * as mockModel from './mockModel'

const restBridge = new RestBridge()

describe('Component: RestBridge', () => {

    describe('#executeQuery()', () => {
        it('check that correct response is returned', () => {
            return restBridge
                .executeQuery(eventful, mockModel.decoratedCdt(1))
                .then(data => {
                    assert.notEqual(data, null)
                    assert.equal(data.response.total_items, 83)
                })
        })
        it('check that correct response is returned when request the second page', () => {
            const paginationArgs = {
                startPage: 2
            }
            return restBridge
                .executeQuery(eventful, mockModel.decoratedCdt(1), paginationArgs)
                .then(data => {
                    assert.notEqual(data, null)
                    assert.equal(data.response.page_number, 2)
                })
        })
        it('check error when a required default parameter is not defined', () => {
            return restBridge
                .executeQuery(noDefaultParameterService, mockModel.decoratedCdt(1))
                .catch(e => {
                    assert.equal(e, 'lack of required parameter \'app_key\'')
                })
        })
        it('check error when a required parameter has no value in the CDT', () => {
            return restBridge
                .executeQuery(noValueParameterService, mockModel.decoratedCdt(1))
                .catch(e => {
                    assert.equal(e, 'lack of required parameter \'location\'')
                })
        })
        it('check error when the service does not respond', () => {
            return restBridge
                .executeQuery(wrongBasePath, mockModel.decoratedCdt(1))
                .catch(e => {
                    assert.notEqual(e, null)
                })
        })
    })

})

const eventful = {
    service: {
        name: 'Eventful',
        type: 'primary',
        protocol: 'rest',
        basePath: 'http://localhost:3000/json'
    },
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

const noDefaultParameterService = {
    service: {
        name: 'eventful',
        type: 'primary',
        protocol: 'rest',
        basePath: 'http://localhost:3000/json'
    },
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

const noValueParameterService = {
    service: {
        name: 'eventful',
        type: 'primary',
        protocol: 'rest',
        basePath: 'http://localhost:3000/json'
    },
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

const wrongBasePath = {
    service: {
        name: 'eventful',
        type: 'primary',
        protocol: 'rest',
        basePath: 'http://localhost:3000'
    },
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

const simpleParameters = [
    {
        name: 'CityName',
        value: 'Milan'
    }
]

const compositeParameters = [
    {
        name: 'CityCoord',
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
]