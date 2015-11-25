//cdt
var cdt = {
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
            name: 'Location',
            for: 'filter|parameter',
            params: [
                {
                    name: 'City',
                    type: 'gps'
                }
            ]
        },
        {
            name: 'Guests',
            for: 'filter|parameter',
            params: [
                {
                    name: 'Number',
                    type: 'Integer',
                    searchFunction: 'testCustomSearch'
                }
            ]
        },
        {
            name: 'Budget',
            for: 'filter|parameter',
            transformFunction: 'translateBudget',
            values: [
                'Low',
                'Medium',
                'High'
            ]
        },
        {
            name: 'RestaurantTipology',
            for: 'filter',
            supportCategory: 'Photo',
            values: [
                'DinnerWithFriends'
            ]
        },
        {
            name: 'Keyword',
            for: 'parameter',
            params: [
                {
                    name: 'search_key',
                    type: 'String'
                }
            ]
        },
        {
            name: 'Transport',
            for: 'filter',
            supportCategory: 'Transport',
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
                'Transport',
                'PublicTransport'
            ]
        }
    ]
};

module.exports.cdt = cdt;

//sample decorated CDT
var decoratedCdt = function (idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant',
                for: 'filter'
            },
            {
                dimension: 'Location',
                for: 'filter|parameter',
                params: [
                    {
                        name: 'City',
                        value: 'Milan'
                    }
                ]
            },
            {
                dimension: 'Guests',
                for: 'filter|parameter',
                params: [
                    {
                        name: 'Number',
                        value: '4',
                        searchFunction: 'testCustomSearch'
                    }
                ]
            },
            {
                dimension: 'Budget',
                value: 'Low',
                for: 'filter|parameter',
                transformFunction: 'translateBudget'
            },
            {
                dimension: 'Keyword',
                for: 'parameter',
                params: [
                    {
                        name: 'search_key',
                        value: 'restaurantinnewyork'
                    }
                ]
            },
            {
                dimension: 'Transport',
                value: 'PublicTransport',
                for: 'filter',
                supportCategory: 'Transport'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends',
                for: 'filter'
            }
        ],
        support: [
            {
                category: 'Transport'
            },
            {
                category: 'Sport'
            },
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};

module.exports.decoratedCdt = decoratedCdt;

//context
var context = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Location',
                params: [
                    {
                        name: 'City',
                        value: 'Milan'
                    }
                ]
            },
            {
                dimension: 'Guests',
                params: [
                    {
                        name: 'Number',
                        value: '4'
                    }
                ]
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends'
            },
            {
                dimension: 'Keyword',
                params: [
                    {
                        name: 'search_key',
                        value: 'restaurantinnewyork'
                    }
                ]
            },
            {
                "dimension": 'Transport',
                "value": 'PublicTransport'
            }
        ],
        support: [
            {
                category: 'Transport'
            },
            {
                category: 'Sport'
            },
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};

module.exports.context = context;

//googlePlaces service
var googlePlaces = {
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
                        'search_key'
                    ]
                },
                {
                    name: 'key',
                    required: true,
                    default: 'AIzaSyDyueyso-B0Vx4rO0F6SuOgv-PaWI12Mio',
                    mappingCDT: []
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
        },
        {
            name: 'nearbySearch',
            path: '/nearbysearch/json',
            parameters: [
                {
                    name: 'location',
                    required: true,
                    default: '-33.8670522,151.1957362',
                    collectionFormat: 'csv',
                    mappingCDT: [
                        'latitude',
                        'longitude'
                    ]
                },
                {
                    name: 'radius',
                    required: true,
                    default: '500',
                    mappingCDT: []
                },
                {
                    name: 'key',
                    required: true,
                    default: 'AIzaSyDyueyso-B0Vx4rO0F6SuOgv-PaWI12Mio',
                    mappingCDT: []
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
var eventful = {
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
                    required: false,
                    default: 'chicago',
                    mappingCDT: [
                        'City'
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
var fakeService = {
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
                        'City'
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
var testBridge = {
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
var wikipedia = {
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
                    default: 'query',
                    mappingCDT: [],
                    mappingTerm: []
                },
                {
                    name: 'titles',
                    required: true,
                    default: 'Italy',
                    mappingCDT: [],
                    mappingTerm: [
                        'search_key'
                    ]
                },
                {
                    name: 'prop',
                    required: true,
                    default: 'revisions',
                    mappingCDT: [],
                    mappingTerm: []
                },
                {
                    name: 'rvprop',
                    required: true,
                    default: 'content',
                    mappingCDT: [],
                    mappingTerm: []
                },
                {
                    name: 'format',
                    required: true,
                    default: 'json',
                    mappingCDT: [],
                    mappingTerm: []
                }
            ]
        }
    ]
};

module.exports.wikipedia = wikipedia;

//google maps support service
var flickr = {
    name: 'Flickr',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchPhoto'
        }
    ]
};

module.exports.flickr = flickr;

//google maps support service
var googleMaps = {
    name: 'GoogleMaps',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchAddress'
        }
    ]
};

module.exports.googleMaps = googleMaps;

//ATM support service
var atm = {
    name: 'ATM',
    type: 'support',
    protocol: 'query',
    basePath: 'http://api.atm-mi.it',
    operations: [
        {
            name: 'searchAddress',
            path: '/searchAddress'
        }
    ]
};

module.exports.atm = atm;

//ATAC support service
var atac = {
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
var fs = {
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
var trenord = {
    name: 'Trenord',
    type: 'support',
    protocol: 'query',
    operations: [
        {
            name: 'searchAddress'
        }
    ]
};

module.exports.trenord = trenord;

//googlePlaces associations
var googlePlacesAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            dimension: 'Tipology',
            value: 'DinnerWithFriends',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            dimension: 'City',
            value: 'Rome',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        }
    ];
};

module.exports.googlePlacesAssociations = googlePlacesAssociations;

//eventful associations
var eventfulAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 2,
            weight: 2,
            _idCDT: idCDT
        }
    ];
};

module.exports.eventfulAssociations = eventfulAssociations;

//fake service associations
var fakeServiceAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'TestServizio',
            value: 'TestSenzaRisposta',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        }
    ];
};

module.exports.fakeServiceAssociation = fakeServiceAssociation;

//test bridge service associations
var testBridgeAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'TestBridge',
            value: 'TestBridge',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        }
    ];
};

module.exports.testBridgeAssociation = testBridgeAssociation;

//google maps service associations
var googleMapsAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'Transport',
            value: 'WithCar',
            _idCDT: idCDT
        }
    ];
};

module.exports.googleMapsAssociation = googleMapsAssociation;

//ATM service associations
var atmAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'Tipology',
            value: 'Bus',
            require: 'Location',
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'City',
            value: 'Milan',
            _idCDT: idCDT
        }
    ];
};

module.exports.atmAssociation = atmAssociation;

//ATAC service associations
var atacAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'Tipology',
            value: 'Bus',
            require: 'Location',
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'City',
            value: 'Rome',
            _idCDT: idCDT
        }
    ];
};

module.exports.atacAssociation = atacAssociation;

//FS service associations
var fsAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'Tipology',
            value: 'Train',
            require: '',
            _idCDT: idCDT
        }
    ];
};

module.exports.fsAssociation = fsAssociation;

//Trenord service associations
var trenordAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'Tipology',
            value: 'Train',
            require: 'Location',
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            dimension: 'City',
            value: 'Milan',
            _idCDT: idCDT
        }
    ];
};

module.exports.trenordAssociation = trenordAssociation;

//Flickr service associations
var flickrAssociation = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            category: 'Photo',
            dimension: 'Tipology',
            value: 'DinnerWithFriends',
            _idCDT: idCDT
        }
    ];
};

module.exports.flickrAssociation = flickrAssociation;