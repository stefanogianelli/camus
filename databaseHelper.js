var _ = require('lodash');
var async = require('async');
var Promise = require('bluebird');

//models
var ServiceModel = require('./models/serviceDescription.js');
var PrimaryServiceModel = require('./models/primaryServiceAssociation.js');
var SupportServiceModel = require('./models/supportServiceAssociation.js');
var cdtModel = require('./models/cdtDescription.js');

var databaseHelper = function () { };

/**
 * This function adds the entries to the database, from a default model
 * @returns {bluebird|exports|module.exports} Returns the identifier of the created CDT
 */
databaseHelper.prototype.createDatabase = function createDatabase () {
    return new Promise(function (resolve, reject) {
        async.waterfall([
            function (callback) {
                //create the CDT
                new cdtModel(cdt).save(function (err, savedCdt) {
                    callback(err, savedCdt._id);
                });
            },
            function (idCdt, callback) {
                //create the services and save their associations
                async.parallel([
                    /*
                    ADD PRIMARY SERVICES BELOW
                     */
                    function (callback) {
                        //save google places service
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(googlePlaces).save(function (err, service) {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            function (idOperation, callback) {
                                _.forEach(googlePlacesAssociations(idOperation, idCdt), function (a) {
                                    new PrimaryServiceModel(a).save(function (err) {
                                        callback(err, 'done');
                                    });
                                });
                            }
                        ], function (err) {
                            callback(err, 'done');
                        });
                    },
                    function (callback) {
                        //save eventful service
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(eventful).save(function (err, service) {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            function (idOperation, callback) {
                                _.forEach(eventfulAssociations(idOperation, idCdt), function (a) {
                                    new PrimaryServiceModel(a).save(function (err) {
                                        callback(err, 'done');
                                    });
                                });
                            }
                        ], function (err) {
                            callback(err, 'done');
                        });
                    },
                    function (callback) {
                        //save cinema stub
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(cinemaStub).save(function (err, service) {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            function (idOperation, callback) {
                                _.forEach(cinemaStubAssociations(idOperation, idCdt), function (a) {
                                    new PrimaryServiceModel(a).save(function (err) {
                                        callback(err, 'done');
                                    });
                                });
                            }
                        ], function (err) {
                            callback(err, 'done');
                        });
                    },
                    /*
                    ADD SUPPORT SERVICES BELOW
                     */
                    function (callback) {
                        //save wikipedia service
                        new ServiceModel(wikipedia).save(function (err) {
                            callback(err, 'done');
                        });
                    },
                    function (callback) {
                        //save google maps service
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(googleMaps).save(function (err, service) {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            function (idOperation, callback) {
                                _.forEach(googleMapsAssociation(idOperation, idCdt), function (a) {
                                    new SupportServiceModel(a).save(function (err) {
                                        callback(err, 'done');
                                    });
                                });
                            }
                        ], function (err) {
                            callback(err, 'done');
                        });
                    }
                    /*
                    END SERVICE INSERTION
                     */
                ], function (err) {
                    callback(err, idCdt);
                });
            }
        ], function (err, idCdt) {
            if (err) {
                reject(err);
            } else {
                resolve(idCdt);
            }
        });
    });
};

/**
 * This function cleans the current database
 * @returns {bluebird|exports|module.exports}
 */
databaseHelper.prototype.deleteDatabase = function deleteDatabase () {
    return new Promise(function (resolve, reject) {
        async.parallel({
                zero: function (callback) {
                    cdtModel.remove({}, function(err) {
                        callback(err, 'done');
                    })
                },
                one: function (callback) {
                    PrimaryServiceModel.remove({}, function(err) {
                        callback(err, 'done');
                    })
                },
                two: function (callback) {
                    ServiceModel.remove({}, function(err) {
                        callback(err, 'done');
                    })
                },
                three: function (callback) {
                    SupportServiceModel.remove({}, function(err) {
                        callback(err, 'done');
                    })
                }
            },
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
};

module.exports = new databaseHelper();

/**
 * MODELS
 */

//CDT
var cdt = {
    _userId: 1,
    context: [
        {
            name: 'InterestTopic',
            for: 'filter',
            values: [
                'Restaurant',
                'Cinema'
            ]
        },
        {
            name: 'Location',
            for: 'filter|parameter',
            params: [
                {
                    name: 'City',
                    type: 'gps',
                    searchFunction: 'testCustomSearch'
                }
            ]
        },
        {
            name: 'Guests',
            for: 'filter|parameter',
            params: [
                {
                    name: 'Number',
                    type: 'Integer'
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

//googlePlaces service
var googlePlaces = {
    name: 'GooglePlaces',
    type: 'primary',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api/place',
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

//eventful service
var eventful = {
    name: 'eventful',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://api.eventful.com//json',
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

//google maps support service
var googleMaps = {
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

//google maps service associations
var googleMapsAssociation = function (idOperation, idCDT) {
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

//cinema stub service
var cinemaStub = {
    name: 'cinemaStub',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/cinema/api/v1/queryDB',
    operations: [
        {
            name: 'search',
            path: '/',
            parameters: [
                {
                    name: 'citta',
                    required: true,
                    default: 'milano',
                    mappingCDT: [
                        'City'
                    ]
                }
            ],
            responseMapping: {
                items: [
                    {
                        termName: 'title',
                        path: 'nome'
                    },
                    {
                        termName: 'address',
                        path: 'indirizzo'
                    },
                    {
                        termName: 'telephone',
                        path: 'telefono'
                    },
                    {
                        termName: 'website',
                        path: 'sito'
                    },
                    {
                        termName: 'latitude',
                        path: 'latitudine'
                    },
                    {
                        termName: 'longitude',
                        path: 'longitudine'
                    }
                ]
            }
        }
    ]
};

//cinema stub associations
var cinemaStubAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Cinema',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        }
    ];
};