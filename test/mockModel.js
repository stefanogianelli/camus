//contex
var context = function(idCDT) {
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
                value: 'newyork',
                for: 'filter|parameter',
                search: 'testCustomSearch'
            },
            {
                dimension: 'Guests',
                value: '4',
                for: 'parameter'
            },
            {
                dimension: 'Budget',
                value: 'Low',
                for: 'filter|parameter',
                transformFunction: 'translateBudget'
            },
            {
                dimension: 'Tipology',
                value: 'DinnerWithFriends',
                for: 'filter'
            },
            {
                "dimension" : "search_key",
                "value" : "restaurantinnewyork",
                "for" : "parameter"
            }
        ]
    }
};

module.exports.context = context;

//wrong context
var wrongContext = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            }
        ]
    }
};

module.exports.wrongContext = wrongContext;

//context with only parameter attribues
var parameterContext = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Guests',
                value: '4',
                for: 'parameter'
            }
        ]
    }
};

module.exports.parameterContext = parameterContext;

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
                    default: '500'
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
                    default: 'cpxgqQcFnbVSmvc2'
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

module.exports.eventful = eventful;

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
            dimension: 'Location',
            value: 'Milan',
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