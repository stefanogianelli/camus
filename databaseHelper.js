'use strict';

import _ from 'lodash';
import async from 'async';
import Promise from 'bluebird';

//models
import ServiceModel from './models/serviceDescription.js';
import PrimaryServiceModel from './models/primaryServiceAssociation.js';
import SupportServiceModel from './models/supportServiceAssociation.js';
import CdtModel from './models/cdtDescription.js';

export default class DatabaseHelper {
    /**
     * This function adds the entries to the database, from a default model
     * @returns {bluebird|exports|module.exports} Returns the identifier of the created CDT
     */
    createDatabase () {
        return new Promise((resolve, reject) => {
            async.waterfall([
                callback => {
                    //create the CDT
                    new CdtModel(cdt).save((err, savedCdt) => {
                        callback(err, savedCdt._id);
                    });
                },
                (idCdt, callback) => {
                    //create the services and save their associations
                    async.parallel([
                        /*
                         ADD PRIMARY SERVICES BELOW
                         */
                        callback => {
                            //save google places service
                            async.waterfall([
                                callback => {
                                    new ServiceModel(googlePlaces).save((err, service) => {
                                        callback(err, service.operations[0].id);
                                    });
                                },
                                (idOperation, callback) => {
                                    _.forEach(googlePlacesAssociations(idOperation, idCdt), a => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save eventful service
                            async.waterfall([
                                callback => {
                                    new ServiceModel(eventful).save((err, service) => {
                                        callback(err, service.operations[0].id);
                                    });
                                },
                                (idOperation, callback) => {
                                    _.forEach(eventfulAssociations(idOperation, idCdt), a => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save cinema stub
                            async.waterfall([
                                callback => {
                                    new ServiceModel(cinemaStub).save((err, service) => {
                                        callback(err, service.operations[0].id);
                                    });
                                },
                                (idOperation, callback) => {
                                    _.forEach(cinemaStubAssociations(idOperation, idCdt), a => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save theater stub
                            async.waterfall([
                                callback => {
                                    new ServiceModel(theaterStub).save((err, service) => {
                                        callback(err, service.operations[0].id);
                                    });
                                },
                                (idOperation, callback) => {
                                    _.forEach(theaterStubAssociations(idOperation, idCdt), a => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save merici stub
                            async.waterfall([
                                callback => {
                                    new ServiceModel(mericiPrimary).save((err, service) => {
                                        callback(err, service.operations[0].id, service.operations[1].id, service.operations[2].id, service.operations[3].id);
                                    });
                                },
                                (idHotel, idFood, idTheater, idMuseum, callback) => {
                                    _.forEach(mericiPrimaryAssociations(idCdt, idHotel, idFood, idTheater, idMuseum), a => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        /*
                         ADD SUPPORT SERVICES BELOW
                         */
                        callback => {
                            //save wikipedia service
                            new ServiceModel(wikipedia).save(err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save google maps service
                            async.waterfall([
                                callback => {
                                    new ServiceModel(googleMaps).save((err, service) => {
                                        callback(err, service.operations[0].id);
                                    });
                                },
                                (idOperation, callback) => {
                                    _.forEach(googleMapsAssociation(idOperation, idCdt), a => {
                                        new SupportServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        },
                        callback => {
                            //save merici support service
                            async.waterfall([
                                callback => {
                                    new ServiceModel(mericiSupport).save((err, service) => {
                                        callback(err, service.operations[0].id, service.operations[1].id, service.operations[2].id);
                                    });
                                },
                                (idTaxi, idCarSharing, idDriver, callback) => {
                                    _.forEach(mericiSupportAssociation(idCdt, idTaxi, idCarSharing, idDriver), a => {
                                        new SupportServiceModel(a).save(err => {
                                            callback(err, 'done');
                                        });
                                    });
                                }
                            ], err => {
                                callback(err, 'done');
                            });
                        }
                        /*
                         END SERVICE INSERTION
                         */
                    ], err => {
                        callback(err, idCdt);
                    });
                }
            ], (err, idCdt) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(idCdt);
                }
            });
        });
    }

    /**
     * This function cleans the current database
     * @returns {bluebird|exports|module.exports}
     */
    deleteDatabase () {
        return new Promise((resolve, reject) => {
            async.parallel([
                callback => {
                    CdtModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                callback => {
                    PrimaryServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                callback => {
                    ServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                callback => {
                    SupportServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                }
            ], err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

/**
 * MODELS
 */

//CDT
const cdt = {
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
const googlePlaces = {
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
        }
    ]
};

//googlePlaces associations
const googlePlacesAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Restaurant',
                    ranking: 1
                }
            ]
        }
    ];
};

//eventful service
const eventful = {
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
const eventfulAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Restaurant',
                    ranking: 2
                }
            ]
        }
    ];
};

//wikipedia support service
const wikipedia = {
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
const googleMaps = {
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
const googleMapsAssociation = (idOperation, idCDT) => {
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
const cinemaStub = {
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
const cinemaStubAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Cinema',
                    ranking: 1
                }
            ]
        }
    ];
};

//theater stub service
const theaterStub = {
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
                        'CityCoord.Latitude'
                    ]
                },
                {
                    name: 'longitude',
                    required: true,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord.Longitude'
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
const theaterStubAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Theater',
                    ranking: 2
                }
            ],
            loc: [9.18951, 45.46427]
        }
    ];
};

//merici primary service
const mericiPrimary = {
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
                        'CityCoord.Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord.Longitude'
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
                        'CityCoord.Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord.Longitude'
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
                        'CityCoord.Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord.Longitude'
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
                        'CityCoord.Latitude'
                    ]
                },
                {
                    name: 'lon',
                    required: false,
                    default: '9.11144',
                    mappingCDT: [
                        'CityCoord.Longitude'
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
const mericiPrimaryAssociations = (idCDT, idHotel, idFood, idTheater, idMuseum) => {
    return [
        {
            _idOperation: idHotel,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Hotel',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idFood,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Restaurant',
                    ranking: 3
                }
            ]
        },
        {
            _idOperation: idTheater,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Theater',
                    ranking: 1
                }
            ]
        },
        {
            _idOperation: idMuseum,
            _idCDT: idCDT,
            associations: [
                {
                    dimension: 'InterestTopic',
                    value: 'Museum',
                    ranking: 1
                }
            ]
        }
    ];
};

//merici support service
const mericiSupport = {
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
const mericiSupportAssociation = (idCDT, idTaxi, idCarSharing, idDriver) => {
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