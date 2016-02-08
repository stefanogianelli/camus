'use strict'

import async from 'async'
import Promise from 'bluebird'

//models
import {
    serviceModel,
    operationModel
} from './models/mongoose/serviceDescription'
import PrimaryServiceModel from './models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from './models/mongoose/supportServiceAssociation'
import CdtModel from './models/mongoose/cdtDescription'
import UserModel from './models/mongoose/user'

/**
 * DatabaseHelper
 */
export default class {
    /**
     * This function adds the entries to the database, from a default model
     * @returns {bluebird|exports|module.exports} Returns the identifier of the created CDT
     */
    createDatabase () {
        return new Promise((resolve, reject) => {
            async.waterfall([
                callback => {
                    new UserModel(user).save((err, user) => {
                        callback(err, user.id)
                    })
                },
                (userId, callback) => {
                    //create the CDT
                    new CdtModel(cdt(userId)).save((err, savedCdt) => {
                        callback(err, savedCdt._id)
                    })
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
                                    new serviceModel(googlePlaces).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(googlePlacesOperations(idService)).save((err, operation) => {
                                       callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(googlePlacesAssociations(idOperation, idCdt), (a, callback) => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        callback => {
                            //save eventful service
                            async.waterfall([
                                callback => {
                                    new serviceModel(eventful).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(eventfulOperations(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(eventfulAssociations(idOperation, idCdt), (a, callback) => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        callback => {
                            //save cinema stub
                            async.waterfall([
                                callback => {
                                    new serviceModel(cinemaStub).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(cinemaStubOperations(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(cinemaStubAssociations(idOperation, idCdt), (a, callback) => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        callback => {
                            //save theater stub
                            async.waterfall([
                                callback => {
                                    new serviceModel(theaterStub).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(theaterStubOperations(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(theaterStubAssociations(idOperation, idCdt), (a, callback) => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        callback => {
                            //save merici stub
                            async.waterfall([
                                callback => {
                                    new serviceModel(mericiPrimary).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    async.map(mericiPrimaryOperations(idService),
                                        (op, callback) => {
                                            new operationModel(op).save((err, operation) => {
                                                callback(err, operation.id)
                                            })
                                        },
                                        (err, operations) => {
                                            callback(err, operations[0], operations[1], operations[2], operations[3])
                                        })
                                },
                                (idHotel, idFood, idTheater, idMuseum, callback) => {
                                    async.each(mericiPrimaryAssociations(idCdt, idHotel, idFood, idTheater, idMuseum), (a, callback) => {
                                        new PrimaryServiceModel(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        /*
                         ADD SUPPORT SERVICES BELOW
                         */
                        callback => {
                            //save google maps service
                            async.waterfall([
                                callback => {
                                    new serviceModel(googleMaps).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(googleMapsOperations(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(googleMapsAssociations(idOperation, idCdt), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                                },
                                (idOperation, callback) => {
                                    new supportConstraint(googleMapsConstraint(idOperation, idCdt)).save(err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        },
                        callback => {
                            //save merici support service
                            async.waterfall([
                                callback => {
                                    new serviceModel(mericiSupport).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    async.map(mericiSupportOperations(idService),
                                        (op, callback) => {
                                            new operationModel(op).save((err, operation) => {
                                                callback(err, operation.id)
                                            })
                                        },
                                        (err, operations) => {
                                            callback(err, operations[0], operations[1], operations[2])
                                        })
                                },
                                (idTaxi, idCarSharing, idDriver, callback) => {
                                    async.each(mericiSupportAssociations(idCdt, idTaxi, idCarSharing, idDriver), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idTaxi, idCarSharing, idDriver)
                                    })
                                },
                                (idTaxi, idCarSharing, idDriver, callback) => {
                                    async.each(mericiSupportConstraints(idCdt, idTaxi, idCarSharing, idDriver), (c, callback) => {
                                        new supportConstraint(c).save(err => {
                                           callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err)
                                    })
                                }
                            ], err => {
                                callback(err)
                            })
                        }
                        /*
                         END SERVICE INSERTION
                         */
                    ], err => {
                        callback(err, idCdt)
                    })
                }
            ], (err, idCdt) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(idCdt)
                }
            })
        })
    }

    /**
     * This function cleans the current database
     * @returns {bluebird|exports|module.exports}
     */
    deleteDatabase () {
        return new Promise((resolve, reject) => {
            async.parallel([
                callback => {
                    UserModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    CdtModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    PrimaryServiceModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    serviceModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    operationModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    supportAssociation.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    supportConstraint.remove({}, err => {
                        callback(err)
                    })
                }
            ], err => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
}

/**
 * MODELS
 */

//User
const user = {
    name: 'Mario',
    surname: 'Rossi',
    mail: 'mario.rossi@mail.com',
    password: 'camus2016'
}

//CDT
const cdt = userId => {
    return {
        _userId: userId,
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
    }
}

//googlePlaces service
const googlePlaces = {
    name: 'GooglePlaces',
    type: 'primary',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api/place'
}

//googlePlaces operations
const googlePlacesOperations = idService => {
    return {
        service: idService,
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
                    run: 'return String(value)'
                },
                {
                    onAttribute: 'longitude',
                    run: 'return String(value)'
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

//googlePlaces associations
const googlePlacesAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 1
        }
    ]
}

//eventful service
const eventful = {
    name: 'eventful',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://api.eventful.com/json'
}

//eventful operations
const eventfulOperations = idService => {
    return {
        service: idService,
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
        },
        pagination: {
            attributeName: 'page_number',
            type: 'number',
            pageCountAttribute: 'page_count'
        }
    }
}

//eventful associations
const eventfulAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 2
        }
    ]
}

//google maps service
const googleMaps = {
    name: 'GoogleMaps',
    type: 'support',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api'
}

//google maps operations
const googleMapsOperations = idService => {
    return {
        service: idService,
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
}

//google maps service associations
const googleMapsAssociations = (idOperation, idCDT) => {
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
const googleMapsConstraint = (idOperation, idCDT) => {
    return {
        _idOperation: idOperation,
        category: 'Transport',
        _idCDT: idCDT,
        constraintCount: 1
    }
}

//cinema stub service
const cinemaStub = {
    name: 'cinemaStub',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/cinema/api/v1/queryDB'
}

//cinema stub operations
const cinemaStubOperations = idService => {
    return {
        service: idService,
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
}

//cinema stub associations
const cinemaStubAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Cinema',
            ranking: 1
        }
    ]
}

//theater stub service
const theaterStub = {
    name: 'theaterStub',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/milanotheater'
}

//theater stub operations
const theaterStubOperations = idService => {
    return {
        service: idService,
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
}

//theater stub associations
const theaterStubAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Theater',
            ranking: 2
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            loc: [9.18951, 45.46427]
        }
    ]
}

//merici primary service
const mericiPrimary = {
    name: 'mericiPrimary',
    type: 'primary',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici'
}

//merici primary operations
const mericiPrimaryOperations = idService => {
    return [
        {
            service: idService,
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
            service: idService,
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
            service: idService,
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
            service: idService,
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
}

//merici primary service associations
const mericiPrimaryAssociations = (idCDT, idHotel, idFood, idTheater, idMuseum) => {
    return [
        {
            _idOperation: idHotel,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Hotel',
            ranking: 1
        },
        {
            _idOperation: idFood,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 3
        },
        {
            _idOperation: idTheater,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Theater',
            ranking: 1
        },
        {
            _idOperation: idMuseum,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Museum',
            ranking: 1
        }
    ]
}

//merici support service
const mericiSupport = {
    name: 'mericiSupport',
    type: 'support',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici'
}

//merici support operations
const mericiSupportOperations = idService => {
    return [
        {
            service: idService,
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
            service: idService,
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
            service: idService,
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
}

//merici support service associations
const mericiSupportAssociations = (idCDT, idTaxi, idCarSharing, idDriver) => {
    return [
        {
            _idOperation: idTaxi,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'Taxi'
        },
        {
            _idOperation: idCarSharing,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'CarSharing'
        },
        {
            _idOperation: idDriver,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Tipology',
            value: 'WithDriver'
        }
    ]
}

//merici support service constraints
const mericiSupportConstraints = (idCDT, idTaxi, idCarSharing, idDriver) => {
    return [
        {
            _idOperation: idTaxi,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1
        },
        {
            _idOperation: idCarSharing,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1
        },
        {
            _idOperation: idDriver,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1
        }
    ]
}