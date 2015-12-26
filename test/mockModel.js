'use strict';

//cdt
export const cdt = {
    _userId: 1,
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
};

//CDT with nested sons
export const nestedCdt = {
    _userId: 1,
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
};

//CDT with multiple sons
export const multipleSonsCdt = {
    _userId: 1,
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
};

//sample decorated CDT
export const decoratedCdt = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
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
        rankingNodes: [
            {
                dimension: 'CityName',
                value: 'Chicago'
            },
            {
                dimension: 'Festivita',
                value: 'Capodanno'
            }
        ],
        specificNodes: [
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
        ],
        parameterNodes: [
            {
                dimension: 'Number',
                value: 4
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'CityName',
                value: 'Chicago'
            },
            {
                dimension: 'SearchKey',
                value: 'restaurantinchicago'
            },
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
        ],
        supportServiceCategories: [ 'Transport' ],
        supportServiceNames: [
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};

//googlePlaces service
export const googlePlaces = {
    name: 'GooglePlaces',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/maps/api/place',
    operations: [
        {
            name: 'placeTextSearch',
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
    ]
};

//eventful service
export const eventful = {
    name: 'Eventful',
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
    ]
};

//fake service with wrong URL
export const fakeService = {
    name: 'fakeService',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/jsonn',
    operations: [
        {
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

//service created for custom bridge testing
export const testBridge = {
    name: 'testBridge',
    type: 'primary',
    protocol: 'custom',
    operations: [
        {
            name: 'placeTextSearch',
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
                        run: 'return \'Restaurant \' + value;',
                        onAttribute: 'title'
                    }
                ]
            }
        }
    ]
};

//wikipedia support service
export const wikipedia = {
    name: 'Wikipedia',
    type: 'support',
    protocol: 'query',
    basePath: 'https://en.wikipedia.org/w',
    operations: [
        {
            name: 'search',
            path: '/api.php',
            parameters: [
                {
                    name: 'action',
                    required: true,
                    default: 'query'
                },
                {
                    name: 'titles',
                    required: true,
                    default: 'Italy',
                    mappingTerm: [
                        'SearchKey'
                    ]
                },
                {
                    name: 'prop',
                    required: true,
                    default: 'revisions'
                },
                {
                    name: 'rvprop',
                    required: true,
                    default: 'content'
                },
                {
                    name: 'format',
                    required: true,
                    default: 'json'
                }
            ]
        }
    ]
};

//google maps support service
export const flickr = {
    name: 'Flickr',
    type: 'support',
    protocol: 'rest',
    basePath: 'http://api.flickr.com',
    operations: [
        {
            name: 'searchPhoto',
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
    ]
};

//google maps support service
export const googleMaps = {
    name: 'GoogleMaps',
    type: 'support',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api',
    operations: [
        {
            name: 'distanceMatrix',
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
    ]
};

//ATM support service
export const atm = {
    name: 'ATM',
    type: 'support',
    protocol: 'query',
    basePath: 'http://api.atm-mi.it',
    operations: [
        {
            name: 'searchAddress',
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
    ]
};

//ATAC support service
export const atac = {
    name: 'ATAC',
    type: 'support',
    protocol: 'query',
    basePath: 'http://api.atac.it',
    operations: [
        {
            name: 'searchAddress',
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
    ]
};

//FS support service
export const fs = {
    name: 'FS',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchAddress'
        }
    ]
};

//Trenord support service
export const trenord = {
    name: 'Trenord',
    type: 'support',
    protocol: 'rest',
    basePath: 'http://api.trenord.it',
    operations: [
        {
            name: 'searchStation',
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
    ]
};

//googlePlaces associations
export const googlePlacesAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Restaurant',
                    ranking: 1
                },
                {
                    dimension: 'Tipology',
                    value: 'DinnerWithFriends',
                    ranking: 1
                }
            ],
            loc: [9.18951, 45.46427]
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            associations: [
                {
                    dimension: 'd',
                    value: 'e',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            associations: [
                {
                    dimension: 'g',
                    value: 'i',
                    ranking: 1
                }
            ]
        }
    ];
};

//eventful associations
export const eventfulAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Restaurant',
                    ranking: 2
                },
                {
                    dimension: 'Festivita',
                    value: 'Capodanno',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            associations: [
                {
                    dimension: 'g',
                    value: 'h',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            associations: [
                {
                    dimension: 'g',
                    value: 'l',
                    ranking: 1
                }
            ]
        }
    ];
};

//fake service associations
export const fakeServiceAssociation = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'TestServizio',
                    value: 'TestSenzaRisposta',
                    ranking: 1
                },
                {
                    dimension: 'Festivita',
                    value: 'Capodanno',
                    ranking: 2
                }
            ]
        },
        {
            _idOperation: idOperation,
            _idCDT: idNestedCDT,
            associations: [
                {
                    dimension: 'g',
                    value: 'i',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idOperation,
            _idCDT: idMultipleSonCDT,
            associations: [
                {
                    dimension: 'h',
                    value: 'n',
                    ranking: 1
                }
            ]
        }
    ];
};

//test bridge service associations
export const testBridgeAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'TestBridge',
                    value: 'TestBridge',
                    ranking: 1
                }
            ]
        }
    ];
};

//google maps service associations
export const googleMapsAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Transport',
                    value: 'WithCar'
                }
            ]
        }
    ];
};

//ATM service associations
export const atmAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Bus'
                }
            ],
            loc: [9.18951, 45.46427]
        }
    ];
};

//ATAC service associations
export const atacAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Bus'
                }
            ],
            loc: [12.51133, 41.89193]
        }
    ];
};

//FS service associations
export const fsAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            require: '',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Train'
                }
            ]
        }
    ];
};

//Trenord service associations
export const trenordAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Train'
                }
            ],
            loc: [9.18951, 45.46427]
        }
    ];
};

//Flickr service associations
export const flickrAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Photo',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'DinnerWithFriends'
                }
            ]
        }
    ];
};