'use strict'

//user
export const user = {
    name: 'Mario',
    surname: 'Rossi',
    mail: 'mario.rossi@mail.com',
    password: 'password'
}

//another user
export const anotherUser = {
    name: 'Marco',
    surname: 'Bianchi',
    mail: 'marco.bianchi@mail.com',
    password: 'password'
}

//cdt
export const cdt = userId => {
    return {
        _userId: [userId],
        context: [
            {
                name: 'InterestTopic',
                for: 'filter',
                values: [
                    'Restaurant',
                    'Hotel'
                ]
            },
            {
                name: 'Festivita',
                for: 'ranking',
                values: [
                    'Natale',
                    'Capodanno'
                ]
            },
            {
                name: 'Location',
                for: 'ranking|parameter',
                parameters: [
                    {
                        name: 'CityName'
                    },
                    {
                        name: 'CityCoord',
                        fields: [
                            {
                                name: 'Latitude'
                            },
                            {
                                name: 'Longitude'
                            }
                        ]
                    }
                ]
            },
            {
                name: 'Guests',
                for: 'parameter',
                parameters: [
                    {
                        name: 'Number',
                        type: 'Integer'
                    }
                ]
            },
            {
                name: 'Budget',
                for: 'filter|parameter',
                values: [
                    'Low',
                    'Medium',
                    'High'
                ]
            },
            {
                name: 'RestaurantTipology',
                for: 'filter',
                values: [
                    'DinnerWithFriends'
                ]
            },
            {
                name: 'Keyword',
                for: 'parameter',
                parameters: [
                    {
                        name: 'SearchKey',
                        type: 'String'
                    }
                ]
            },
            {
                name: 'Transport',
                for: 'filter',
                values: [
                    'PublicTransport',
                    'WithCar'
                ]
            },
            {
                name: 'Tipology',
                for: 'filter',
                values: [
                    'Bus',
                    'Train'
                ],
                parents: [
                    'PublicTransport'
                ]
            }
        ]
    }
}

export const globalMashup = {
    list: [
        {
            topics: [ 'Restaurant' ],
            contents: [
                {
                    type: 'text',
                    contents: [ 'title' ]
                },
                {
                    type: 'text',
                    contents: [ 'address' ]
                }
            ]
        },
        {
            topics: [ 'Movies' ],
            contents: [
                {
                    type: 'text',
                    contents: [ 'title' ]
                },
                {
                    type: 'text',
                    contents: [ 'address' ]
                }
            ]
        }
    ],
    details: [
        {
            topics: [ 'Movies' ],
            contents: [
                {
                    type: 'text',
                    contents: [ 'title' ]
                },
                {
                    type: 'text',
                    contents: [ 'address' ]
                },
                {
                    type: 'text',
                    contents: [ 'longitude' ]
                }
            ]
        },
        {
            topics: [ 'Restaurants' ],
            contents: [
                {
                    type: 'text',
                    contents: [ 'title' ]
                },
                {
                    type: 'text',
                    contents: [ 'address' ]
                },
                {
                    type: 'map',
                    contents: [ 'longitude', 'latitude' ]
                }
            ]
        }
    ]
}

export const userMashup = userId => {
    return {
        _userId: [ userId ],
        list: [
            {
                topics: ['Restaurant'],
                contents: [
                    {
                        type: 'text',
                        contents: ['title']
                    },
                    {
                        type: 'text',
                        contents: ['address']
                    }
                ]
            }
        ],
        details: [
            {
                topics: ['Restaurants'],
                contents: [
                    {
                        type: 'text',
                        contents: ['title']
                    },
                    {
                        type: 'text',
                        contents: ['address']
                    },
                    {
                        type: 'map',
                        contents: ['longitude', 'latitude']
                    }
                ]
            }
        ]
    }
}

//CDT with nested sons
export const nestedCdt = userId => {
    return {
        _userId: userId,
        context: [
            {
                name: 'a',
                for: 'filter',
                values: [
                    'b', 'c'
                ]
            },
            {
                name: 'd',
                for: 'filter',
                values: [
                    'e', 'f'
                ],
                parents: [
                    'b'
                ]
            },
            {
                name: 'g',
                for: 'filter',
                values: [
                    'h', 'i'
                ],
                parents: [
                    'f', 'b'
                ]
            }
        ]
    }
}

//CDT with multiple sons
export const multipleSonsCdt = userId => {
    return {
        _userId: userId,
        context: [
            {
                name: 'a',
                for: 'filter',
                values: [
                    'c', 'd'
                ]
            },
            {
                name: 'b',
                for: 'filter',
                values: [
                    'e', 'f'
                ]
            },
            {
                name: 'g',
                for: 'filter',
                values: [
                    'i', 'l'
                ],
                parents: [
                    'd'
                ]
            },
            {
                name: 'h',
                for: 'filter',
                values: [
                    'm', 'n'
                ],
                parents: [
                    'e'
                ]
            }
        ]
    }
}

//sample decorated CDT
export const decoratedCdt = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                name: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                name: 'Budget',
                value: 'Low'
            },
            {
                name: 'Transport',
                value: 'PublicTransport'
            },
            {
                name: 'Tipology',
                value: 'Bus'
            },
            {
                name: 'Tipology',
                value: 'Train'
            }
        ],
        rankingNodes: [
            {
                name: 'CityName',
                value: 'Chicago'
            },
            {
                name: 'Festivita',
                value: 'Capodanno'
            }
        ],
        specificNodes: [
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
        ],
        parameterNodes: [
            {
                name: 'Number',
                value: 4
            },
            {
                name: 'Budget',
                value: 'Low'
            },
            {
                name: 'CityName',
                value: 'Chicago'
            },
            {
                name: 'SearchKey',
                value: 'restaurantinchicago'
            },
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
        ],
        supportServiceCategories: [ 'Transport' ]
    }
}

//googlePlaces service
export const googlePlaces = {
    name: 'GooglePlaces',
    protocol: 'rest',
    basePath: 'http://localhost:3000/maps/api/place'
}

export const googlePlacesOperation = idService => {
    return {
        service: idService,
        name: 'placeTextSearch',
        type: 'primary',
        path: '/textsearch/json',
        parameters: [
            {
                name: 'query',
                required: true,
                default: 'restaurant+in+milan',
                mappingCDT: [
                    'SearchKey'
                ]
            },
            {
                name: 'key',
                required: true,
                default: 'AIzaSyDyueyso-B0Vx4rO0F6SuOgv-PaWI12Mio'
            }
        ],
        responseMapping: {
            list: 'results',
            items: [
                {
                    termName: 'title',
                    path: 'name'
                },
                {
                    termName: 'address',
                    path: 'formatted_address'
                },
                {
                    termName: 'latitude',
                    path: 'geometry.location.lat'
                },
                {
                    termName: 'longitude',
                    path: 'geometry.location.lng'
                }
            ]
        },
        pagination: {
            attributeName: 'pagetoken',
            type: 'token',
            tokenAttribute: 'next_page_token'
        }
    }
}

//eventful service
export const eventful = {
    name: 'Eventful',
    protocol: 'rest',
    basePath: 'http://localhost:3000/json'
}

export const eventfulOperation = idService => {
    return {
        service: idService,
        name: 'eventSearch',
        type: 'primary',
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
            pageCountAttribute: 'page_count'
        }
    }
}

//fake service with wrong URL
export const fakeService = {
    name: 'fakeService',
    protocol: 'rest',
    basePath: 'http://localhost:3000/jsonn'
}

export const fakeServiceOperation = idService => {
    return {
        service: idService,
        name: 'eventSearch',
        type: 'primary',
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
}

//service created for custom bridge testing
export const testBridge = {
    name: 'testBridge',
    protocol: 'custom'
}

export const testBridgeOperation = idService => {
    return {
        service: idService,
        name: 'placeTextSearch',
        type: 'primary',
        bridgeName: 'testBridge',
        responseMapping: {
            list: 'results',
            items: [
                {
                    termName: 'title',
                    path: 'name'
                },
                {
                    termName: 'address',
                    path: 'formatted_address'
                },
                {
                    termName: 'latitude',
                    path: 'geometry.location.lat'
                },
                {
                    termName: 'longitude',
                    path: 'geometry.location.lng'
                }
            ],
            functions: [
                {
                    run: 'return \'Restaurant \' + value',
                    onAttribute: 'title'
                }
            ]
        }
    }
}


//google maps support service
export const flickr = {
    name: 'Flickr',
    protocol: 'rest',
    basePath: 'http://api.flickr.com'
}

export const flickrOperations = idService => {
    return {
        service: idService,
        name: 'searchPhoto',
        type: 'support',
        path: '/photos',
        parameters: [
            {
                name: 'tag',
                mappingTerm: [
                    'tag'
                ]
            }
        ]
    }
}

//google maps support service
export const googleMaps = {
    name: 'GoogleMaps',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api'
}

export const googleMapsOperations = idService => {
    return {
        service: idService,
        name: 'distanceMatrix',
        type: 'support',
        path: '/distancematrix/json',
        parameters: [
            {
                name: 'origins',
                mappingTerm: [
                    'startCity'
                ]
            },
            {
                name: 'destinations',
                mappingTerm: [
                    'endCity'
                ]
            },
            {
                name: 'mode',
                default: 'bus'
            }
        ]
    }
}

//ATM support service
export const atm = {
    name: 'ATM',
    protocol: 'query',
    basePath: 'http://api.atm-mi.it'
}

export const atmOperations = idService => {
    return {
        service: idService,
        name: 'searchAddress',
        type: 'support',
        path: '/searchAddress',
        parameters: [
            {
                name: 'from',
                collectionFormat: 'pipes',
                mappingTerm: [
                    'latitude',
                    'longitude'
                ]
            },
            {
                name: 'to',
                collectionFormat: 'pipes',
                mappingTerm: [
                    'latitude',
                    'longitude'
                ]
            },
            {
                name: 'key',
                default: 'abc123'
            }
        ]
    }
}

//ATAC support service
export const atac = {
    name: 'ATAC',
    protocol: 'query',
    basePath: 'http://api.atac.it'
}

export const atacOperations = idService => {
    return {
        service: idService,
        name: 'searchAddress',
        type: 'support',
        path: '/searchAddress',
        parameters: [
            {
                name: 'from',
                collectionFormat: 'pipes',
                mappingTerm: [
                    'latitude',
                    'longitude'
                ]
            },
            {
                name: 'to',
                collectionFormat: 'pipes',
                mappingTerm: [
                    'latitude',
                    'longitude'
                ]
            },
            {
                name: 'key',
                default: 'abc123'
            }
        ]
    }
}

//FS support service
export const fs = {
    name: 'FS',
    protocol: 'query'
}

export const fsOperations = idService => {
    return {
        service: idService,
        name: 'searchAddress',
        type: 'support'
    }
}

//Trenord support service
export const trenord = {
    name: 'Trenord',
    protocol: 'rest',
    basePath: 'http://api.trenord.it'
}

export const trenordOperations = idService => {
    return {
        service: idService,
        name: 'searchStation',
        type: 'support',
        path: '/searchStation',
        parameters: [
            {
                name: 'fromStation',
                mappingTerm: [
                    'startStationName'
                ]
            },
            {
                name: 'toStation',
                mappingTerm: [
                    'endStationName'
                ]
            }
        ]
    }
}

//googlePlaces associations
export const googlePlacesAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'DinnerWithFriends',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            loc: [9.18951, 45.46427]
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            dimension: 'd',
            value: 'e',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            dimension: 'g',
            value: 'i',
            ranking: 1
        }
    ]
}

//eventful associations
export const eventfulAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 2
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'Festivita',
            value: 'Capodanno',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            dimension: 'g',
            value: 'h',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            dimension: 'g',
            value: 'l',
            ranking: 1
        }
    ]
}

//fake service associations
export const fakeServiceAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'TestServizio',
            value: 'TestSenzaRisposta',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'Festivita',
            value: 'Capodanno',
            ranking: 2
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            dimension: 'g',
            value: 'i',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            dimension: 'h',
            value: 'n',
            ranking: 1
        }
    ]
}

//test bridge service associations
export const testBridgeAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'TestBridge',
            value: 'TestBridge',
            ranking: 1
        }
    ]
}

//google maps service associations
export const googleMapsAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'WithCar'
        }
    ]
}

//google maps service constraint
export const googleMapsConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 1
    }
}

//ATM service associations
export const atmAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'Bus'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            loc: [9.18951, 45.46427]
        }
    ]
}

//ATM service constraint
export const atmConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 2
    }
}

//ATAC service associations
export const atacAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'Bus'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            loc: [12.51133, 41.89193]
        }
    ]
}

//ATAC service constraint
export const atacConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 2
    }
}

//FS service associations
export const fsAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'Train'
        }
    ]
}

//FS service constraint
export const fsConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 1
    }
}

//Trenord service associations
export const trenordAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'Train'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            loc: [9.18951, 45.46427]
        }
    ]
}

//Trenord service constraint
export const trenordConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 2
    }
}

//Flickr service associations
export const flickrAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Photo',
            _idCDT: idCDT,
                    dimension: 'Tipology',
                    value: 'DinnerWithFriends'
        }
    ]
}

//Flickr service constraint
export const flickrConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Photo',
        _idCDT: idCDT,
        constraintCount: 1
    }
}