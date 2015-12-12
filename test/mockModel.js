'use strict';

//cdt
let cdt = {
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

module.exports.cdt = cdt;

//CDT with nested sons
let nestedCdt = {
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

module.exports.nestedCdt = nestedCdt;

//CDT with multiple sons
let multipleSonsCdt = {
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

module.exports.multipleSonsCdt = multipleSonsCdt;

//sample decorated CDT
let decoratedCdt = idCDT => {
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
                value: 'Milan'
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
                value: 'Milan'
            },
            {
                dimension: 'SearchKey',
                value: 'restaurantinnewyork'
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

module.exports.decoratedCdt = decoratedCdt;

//googlePlaces service
let googlePlaces = {
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
            }
        }
    ]
};

module.exports.googlePlaces = googlePlaces;

//eventful service
let eventful = {
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
            }
        }
    ]
};

module.exports.eventful = eventful;

//fake service with wrong URL
let fakeService = {
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

module.exports.fakeService = fakeService;

//service created for custom bridge testing
let testBridge = {
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

module.exports.testBridge = testBridge;

//wikipedia support service
let wikipedia = {
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

module.exports.wikipedia = wikipedia;

//google maps support service
let flickr = {
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

module.exports.flickr = flickr;

//google maps support service
let googleMaps = {
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

module.exports.googleMaps = googleMaps;

//ATM support service
let atm = {
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

module.exports.atm = atm;

//ATAC support service
let atac = {
    name: 'ATAC',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchAddress'
        }
    ]
};

module.exports.atac = atac;

//FS support service
let fs = {
    name: 'FS',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchAddress'
        }
    ]
};

module.exports.fs = fs;

//Trenord support service
let trenord = {
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

module.exports.trenord = trenord;

//googlePlaces associations
let googlePlacesAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
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
            geo: {
                coord: [9.18951, 45.46427],
                radius: 10
            }
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

module.exports.googlePlacesAssociations = googlePlacesAssociations;

//eventful associations
let eventfulAssociations = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
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

module.exports.eventfulAssociations = eventfulAssociations;

//fake service associations
let fakeServiceAssociation = (idOperation, idCDT, idNestedCDT, idMultipleSonCDT) => {
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

module.exports.fakeServiceAssociation = fakeServiceAssociation;

//test bridge service associations
let testBridgeAssociation = (idOperation, idCDT) => {
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

module.exports.testBridgeAssociation = testBridgeAssociation;

//google maps service associations
let googleMapsAssociation = (idOperation, idCDT) => {
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

module.exports.googleMapsAssociation = googleMapsAssociation;

//ATM service associations
let atmAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Bus'
                }
            ],
            geo: {
                coord: [9.18951, 45.46427],
                radius: 10
            }
        }
    ];
};

module.exports.atmAssociation = atmAssociation;

//ATAC service associations
let atacAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Bus'
                }
            ],
            geo: {
                coord: [12.51133, 41.89193],
                radius: 18
            }
        }
    ];
};

module.exports.atacAssociation = atacAssociation;

//FS service associations
let fsAssociation = (idOperation, idCDT) => {
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

module.exports.fsAssociation = fsAssociation;

//Trenord service associations
let trenordAssociation = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Train'
                }
            ],
            geo: {
                coord: [9.18951, 45.46427],
                radius: 10
            }
        }
    ];
};

module.exports.trenordAssociation = trenordAssociation;

//Flickr service associations
let flickrAssociation = (idOperation, idCDT) => {
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

module.exports.flickrAssociation = flickrAssociation;