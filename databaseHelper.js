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
                    function (callback) {
                        //save theater stub
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(theaterStub).save(function (err, service) {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            function (idOperation, callback) {
                                _.forEach(theaterStubAssociations(idOperation, idCdt), function (a) {
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
                        //save merici stub
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(mericiPrimary).save(function (err, service) {
                                    callback(err, service.operations[0].id, service.operations[1].id, service.operations[2].id, service.operations[3].id);
                                });
                            },
                            function (idHotel, idFood, idTheater, idMuseum, callback) {
                                _.forEach(mericiPrimaryAssociations(idCdt, idHotel, idFood, idTheater, idMuseum), function (a) {
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
                    },
                    function (callback) {
                        //save merici support service
                        async.waterfall([
                            function (callback) {
                                new ServiceModel(mericiSupport).save(function (err, service) {
                                    callback(err, service.operations[0].id, service.operations[1].id, service.operations[2].id);
                                });
                            },
                            function (idTaxi, idCarSharing, idDriver, callback) {
                                _.forEach(mericiSupportAssociation(idCdt, idTaxi, idCarSharing, idDriver), function (a) {
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
        async.parallel([
            function (callback) {
                cdtModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            },
            function (callback) {
                PrimaryServiceModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            },
            function (callback) {
                ServiceModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            },
            function (callback) {
                SupportServiceModel.remove({}, function(err) {
                    callback(err, 'done');
                })
            }
        ], function (err) {
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
                'Cinema',
                'Theater',
                'Hotel',
                'Museum'
            ]
        },
        {
            name: 'Location',
            for: 'ranking|parameter',
            params: [
                {
                    name: 'CityName'
                },
                {
                    name: 'CityCoord',
                    format: 'Latitude|Longitude',
                    searchFunction: 'locationSearch'
                }
            ]
        },
        {
            name: 'Keyword',
            for: 'parameter',
            params: [
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
                'Train',
                'Taxi',
                'CarSharing',
                'WithDriver'
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
                        'SearchKey'
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
                ],
                functions: [
                    {
                        onAttribute: 'latitude',
                        run: 'return String(value);'
                    },
                    {
                        onAttribute: 'longitude',
                        run: 'return String(value);'
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
                        'CityCoord#Latitude',
                        'CityCoord#Longitude'
                    ]
                },
                {
                    name: 'radius',
                    required: true,
                    default: '50',
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

//eventful associations
var eventfulAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 2,
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
                        'title'
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
                    default: 'car'
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
                    default: 'Milano',
                    mappingCDT: [
                        'CityName'
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
            _idCDT: idCDT
        }
    ];
};

//theater stub service
var theaterStub = {
    name: 'theaterStub',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/milanotheater',
    operations: [
        {
            name: 'search',
            path: '/rest.php',
            parameters: [
                {
                    name: 'latitude',
                    required: true,
                    default: '45.46867',
                    mappingCDT: [
                        'CityCoord#Latitude'
                    ]
                },
                {
                    name: 'longitude',
                    required: true,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord#Longitude'
                    ]
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
                        path: 'address'
                    },
                    {
                        termName: 'telephone',
                        path: 'tel'
                    },
                    {
                        termName: 'website',
                        path: 'url'
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

//theater stub associations
var theaterStubAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Theater',
            ranking: 2,
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            dimension: 'CityCoord',
            value: '45.46427|9.18951|10',
            format: 'Latitude|Longitude|Radius',
            _idCDT: idCDT
        }
    ];
};

//merici primary service
var mericiPrimary = {
    name: 'mericiPrimary',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici',
    operations: [
        {
            name: 'searchHotel',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'hotel'
                },
                {
                    name: 'place',
                    required: false,
                    default: 'rome',
                    mappingCDT: [
                        'CityName'
                    ]
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingCDT: [
                        'CityCoord#Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord#Longitude'
                    ]
                }
            ],
            responseMapping: {
                list: 'services',
                items: [
                    {
                        termName: 'title',
                        path: 'name'
                    },
                    {
                        termName: 'address',
                        path: 'route'
                    },
                    {
                        termName: 'city',
                        path: 'locality'
                    },
                    {
                        termName: 'telephone',
                        path: 'phone'
                    },
                    {
                        termName: 'website',
                        path: 'site'
                    },
                    {
                        termName: 'email',
                        path: 'email'
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
        },
        {
            name: 'searchFood',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'food'
                },
                {
                    name: 'place',
                    required: false,
                    default: 'rome',
                    mappingCDT: [
                        'CityName'
                    ]
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingCDT: [
                        'CityCoord#Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord#Longitude'
                    ]
                }
            ],
            responseMapping: {
                list: 'services',
                items: [
                    {
                        termName: 'title',
                        path: 'name'
                    },
                    {
                        termName: 'address',
                        path: 'route'
                    },
                    {
                        termName: 'city',
                        path: 'locality'
                    },
                    {
                        termName: 'telephone',
                        path: 'phone'
                    },
                    {
                        termName: 'website',
                        path: 'site'
                    },
                    {
                        termName: 'email',
                        path: 'email'
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
        },
        {
            name: 'searchTheater',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'theater'
                },
                {
                    name: 'place',
                    required: false,
                    default: 'rome',
                    mappingCDT: [
                        'CityName'
                    ]
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingCDT: [
                        'CityCoord#Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord#Longitude'
                    ]
                }
            ],
            responseMapping: {
                list: 'services',
                items: [
                    {
                        termName: 'title',
                        path: 'name'
                    },
                    {
                        termName: 'address',
                        path: 'route'
                    },
                    {
                        termName: 'city',
                        path: 'locality'
                    },
                    {
                        termName: 'telephone',
                        path: 'phone'
                    },
                    {
                        termName: 'website',
                        path: 'site'
                    },
                    {
                        termName: 'email',
                        path: 'email'
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
        },
        {
            name: 'searchMuseum',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'museum'
                },
                {
                    name: 'place',
                    required: false,
                    default: 'rome',
                    mappingCDT: [
                        'CityName'
                    ]
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingCDT: [
                        'CityCoord#Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord#Longitude'
                    ]
                }
            ],
            responseMapping: {
                list: 'services',
                items: [
                    {
                        termName: 'title',
                        path: 'name'
                    },
                    {
                        termName: 'address',
                        path: 'route'
                    },
                    {
                        termName: 'city',
                        path: 'locality'
                    },
                    {
                        termName: 'telephone',
                        path: 'phone'
                    },
                    {
                        termName: 'website',
                        path: 'site'
                    },
                    {
                        termName: 'email',
                        path: 'email'
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

//merici primary service associations
var mericiPrimaryAssociations = function (idCDT, idHotel, idFood, idTheater, idMuseum) {
    return [
        {
            _idOperation: idHotel,
            dimension: 'InterestTopic',
            value: 'Hotel',
            ranking: 1,
            _idCDT: idCDT
        },
        {
            _idOperation: idFood,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 3,
            _idCDT: idCDT
        },
        {
            _idOperation: idTheater,
            dimension: 'InterestTopic',
            value: 'Theater',
            ranking: 1,
            _idCDT: idCDT
        },
        {
            _idOperation: idMuseum,
            dimension: 'InterestTopic',
            value: 'Museum',
            ranking: 1,
            _idCDT: idCDT
        }
    ];
};

//merici support service
var mericiSupport = {
    name: 'mericiSupport',
    type: 'support',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici',
    operations: [
        {
            name: 'searchTaxi',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'taxi'
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingTerm: [
                        'latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingTerm: [
                        'longitude'
                    ]
                }
            ]
        },
        {
            name: 'searchCarSharing',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'carsharing'
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingTerm: [
                        'latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingTerm: [
                        'longitude'
                    ]
                }
            ]
        },
        {
            name: 'searchDriver',
            path: '/service_process.php',
            parameters: [
                {
                    name: 'service',
                    required: true,
                    default: 'driver'
                },
                {
                    name: 'lat',
                    required: false,
                    default: '45.46867',
                    mappingTerm: [
                        'latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingTerm: [
                        'longitude'
                    ]
                }
            ]
        }
    ]
};

//merici support service associations
var mericiSupportAssociation = function (idCDT, idTaxi, idCarSharing, idDriver) {
    return [
        {
            _idOperation: idTaxi,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'Taxi'
                }
            ]
        },
        {
            _idOperation: idCarSharing,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'CarSharing'
                }
            ]
        },
        {
            _idOperation: idDriver,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1,
            associations: [
                {
                    dimension: 'Tipology',
                    value: 'WithDriver'
                }
            ]
        }
    ];
};