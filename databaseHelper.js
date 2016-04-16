'use strict'

import async from 'async'
import Promise from 'bluebird'

//models
import {
    serviceModel,
    operationModel
} from './src/models/mongoose/serviceDescription'
import PrimaryServiceModel from './src/models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from './src/models/mongoose/supportServiceAssociation'
import {
    cdtModel,
    globalCdtModel
} from './src/models/mongoose/cdtDescription'
import UserModel from './src/models/mongoose/user'
import {
    mashupModel,
    globalMashupModel
} from './src/models/mongoose/mashupSchema'

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
                    new mashupModel(globalMashup).save((err, mashup) => {
                        callback(err, mashup._id)
                    })
                },
                (mashupId, callback) => {
                    new globalMashupModel({mashupId: mashupId}).save(err => {
                        callback(err)
                    })
                },
                callback => {
                    //create the CDT
                    new cdtModel(cdt).save((err, savedCdt) => callback(err, savedCdt._id))
                },
                (idCdt, callback) => {
                    new globalCdtModel({globalId: idCdt}).save(err => callback(err, idCdt))
                },
                (idCdt, callback) => {
                    //save the CDT identifier
                    this._idCdt = idCdt
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
                                    new operationModel(googlePlacesOperation(idService)).save((err, operation) => {
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
                                    new operationModel(eventfulOperation(idService)).save((err, operation) => {
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
                                    new operationModel(cinemaStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(theaterStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(mericiPrimaryOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiPrimaryAssociations(idCdt, idOperation), (a, callback) => {
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
                                    async.map(googleMapsOperations(idService), (o, callback) => {
                                        new operationModel(o).save((err, operation) => {
                                            callback(err, operation.id)
                                        })
                                    },
                                    (err, results) => {
                                        callback(err, results[0], results[1])
                                    })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsAssociations(idOperationiOS, idOperationAndroid, idCdt), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperationiOS, idOperationAndroid)
                                    })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsConstraints(idOperationiOS, idOperationAndroid, idCdt), (c, callback) => {
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
                                    new operationModel(mericiSupportOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportConstraints(idCdt, idOperation), (c, callback) => {
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
                        },
                        callback => {
                            //save apple maps support service
                            async.waterfall([
                                callback => {
                                    new serviceModel(appleMaps).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(appleMapsOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsConstraints(idCdt, idOperation), (c, callback) => {
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
                        callback(err)
                    })
                },
                /**
                 * ADD THE FIRST USER
                 */
                callback => {
                    new UserModel(user1).save((err, user) => callback(err, user.id))
                },
                (userId, callback) => {
                    //create the CDT
                    new cdtModel(cdt1(userId)).save((err, cdt) => callback(err, cdt._id))
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
                                    new operationModel(googlePlacesOperation(idService)).save((err, operation) => {
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
                                    new operationModel(eventfulOperation(idService)).save((err, operation) => {
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
                                    new operationModel(cinemaStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(theaterStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(mericiPrimaryOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiPrimaryAssociations(idCdt, idOperation), (a, callback) => {
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
                                    async.map(googleMapsOperations(idService), (o, callback) => {
                                            new operationModel(o).save((err, operation) => {
                                                callback(err, operation.id)
                                            })
                                        },
                                        (err, results) => {
                                            callback(err, results[0], results[1])
                                        })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsAssociations(idOperationiOS, idOperationAndroid, idCdt), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperationiOS, idOperationAndroid)
                                        })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsConstraints(idOperationiOS, idOperationAndroid, idCdt), (c, callback) => {
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
                                    new operationModel(mericiSupportOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportConstraints(idCdt, idOperation), (c, callback) => {
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
                        },
                        callback => {
                            //save apple maps support service
                            async.waterfall([
                                callback => {
                                    new serviceModel(appleMaps).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(appleMapsOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsConstraints(idCdt, idOperation), (c, callback) => {
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
                        callback(err)
                    })
                },
                /**
                 * ADD THE SECOND USER
                 */
                callback => {
                    new UserModel(user2).save((err, user) => {
                        callback(err, user.id)
                    })
                },
                (userId, callback) => {
                    //create the CDT
                    new cdtModel(cdt2(userId)).save((err, cdt) => callback(err, cdt._id))
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
                                    new operationModel(googlePlacesOperation(idService)).save((err, operation) => {
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
                                    new operationModel(eventfulOperation(idService)).save((err, operation) => {
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
                                    new operationModel(cinemaStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(theaterStubOperation(idService)).save((err, operation) => {
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
                                    new operationModel(mericiPrimaryOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiPrimaryAssociations(idCdt, idOperation), (a, callback) => {
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
                                    async.map(googleMapsOperations(idService), (o, callback) => {
                                            new operationModel(o).save((err, operation) => {
                                                callback(err, operation.id)
                                            })
                                        },
                                        (err, results) => {
                                            callback(err, results[0], results[1])
                                        })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsAssociations(idOperationiOS, idOperationAndroid, idCdt), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperationiOS, idOperationAndroid)
                                        })
                                },
                                (idOperationiOS, idOperationAndroid, callback) => {
                                    async.each(googleMapsConstraints(idOperationiOS, idOperationAndroid, idCdt), (c, callback) => {
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
                                    new operationModel(mericiSupportOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(mericiSupportConstraints(idCdt, idOperation), (c, callback) => {
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
                        },
                        callback => {
                            //save apple maps support service
                            async.waterfall([
                                callback => {
                                    new serviceModel(appleMaps).save((err, service) => {
                                        callback(err, service.id)
                                    })
                                },
                                (idService, callback) => {
                                    new operationModel(appleMapsOperation(idService)).save((err, operation) => {
                                        callback(err, operation.id)
                                    })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsAssociations(idCdt, idOperation), (a, callback) => {
                                            new supportAssociation(a).save(err => {
                                                callback(err)
                                            })
                                        },
                                        err => {
                                            callback(err, idOperation)
                                        })
                                },
                                (idOperation, callback) => {
                                    async.each(appleMapsConstraints(idCdt, idOperation), (c, callback) => {
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
                        callback(err)
                    })
                }
            ], err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(this._idCdt)
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
                    cdtModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    globalCdtModel.remove({}, err => {
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
                },
                callback => {
                    mashupModel.remove({}, err => {
                        callback(err)
                    })
                },
                callback => {
                    globalMashupModel.remove({}, err => {
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

//Sample user 1
const user1 = {
    name: 'Mario',
    surname: 'Rossi',
    mail: 'mrossi@mail.com',
    password: 'camus2016'
}

//Sample user 2
const user2 = {
    name: 'Roberto',
    surname: 'Bianchi',
    mail: 'rbianchi@mail.com',
    password: 'camus2016'
}

//Universal CDT
const cdt = {
    context: [
        {
            name: 'InterestTopic',
            for: 'filter',
            values: [
                'Restaurant',
                'Cinema',
                'Theater',
                'Hotel',
                'Museum',
                'Event'
            ]
        },
        {
            name: 'Location',
            for: 'ranking|parameter',
            parameters: [
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
            name: 'Transport',
            for: 'filter',
            values: [
                'PublicTransport',
                'WithCar'
            ]
        },
        {
            name: 'Typology',
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
        },
        {
            name: 'OS',
            for: 'filter',
            values: [
                'iOS',
                'Android'
            ]
        }
    ]
}

//global mashup schema
const globalMashup = {
    list: [
        {
            topics: [
                "Restaurant", "Hotel", "Theater", "Museum", "Event"
            ],
            contents: [
                {
                    type:"text",
                    contents: "title"
                },
                {
                    type: "text",
                    contents: "address"
                }
            ]
        },
        {
            topics: [
                "Cinema"
            ],
            contents: [
                {
                    type: "text",
                    contents: "title"

                },
                {
                    type: "text",
                    contents: "address"
                }
            ]

        }
    ],
    details: [
        {
            topics: [
                "Cinema", "Hotel", "Theater", "Museum", "Event"
            ],
            contents: [
                {
                    type: "text",
                    contents: "title"
                },
                {
                    type: "text",
                    contents: "address"
                },
                {
                    type: "map",
                    contents: [
                        "latitude",
                        "longitude"
                    ]
                },
                {
                    type: "phoneNumber",
                    contents: "telephone"
                },
                {
                    type: "website",
                    contents: "website"
                },
                {
                    type: "email",
                    contents: "email"
                },
                {
                    type: "support",
                    contents: "support"
                },
                {
                    type: "text",
                    contents: "meta"
                }
            ]
        },
        {
            topics: [ "Restaurant" ],
            contents:[
                {
                    type: "text",
                    contents: "title"
                },
                {
                    type: "text",
                    contents: "address"
                },
                {
                    type: "map",
                    contents: [
                        "longitude", "latitude"
                    ]
                },
                {
                    type: "text",
                    contents: "email"
                },
                {
                    type: "support",
                    contents: "transport"

                },
                {
                    type: "text",
                    contents: "meta"
                }
            ]
        }
    ]
}

//Tailored CDT 1
const cdt1 = userId => {
    return {
        _userId: [userId],
        context: [
            {
                name: 'InterestTopic',
                for: 'filter',
                values: [
                    'Restaurant',
                    'Event'
                ]
            },
            {
                name: 'Location',
                for: 'ranking|parameter',
                parameters: [
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
                name: 'Transport',
                for: 'filter',
                values: [
                    'PublicTransport',
                    'WithCar'
                ]
            },
            {
                name: 'Typology',
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
            },
            {
                name: 'OS',
                for: 'filter',
                values: [
                    'iOS',
                    'Android'
                ]
            }
        ]
    }
}

//Tailored CDT 2
const cdt2 = userId => {
    return {
        _userId: [userId],
        context: [
            {
                name: 'InterestTopic',
                for: 'filter',
                values: [
                    'Restaurant',
                    'Cinema',
                    'Theater',
                    'Hotel',
                    'Museum',
                    'Event'
                ]
            },
            {
                name: 'Location',
                for: 'ranking|parameter',
                parameters: [
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
                name: 'Transport',
                for: 'filter',
                values: [
                    'PublicTransport',
                    'WithCar'
                ]
            },
            {
                name: 'Typology',
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
            },
            {
                name: 'OS',
                for: 'filter',
                values: [
                    'iOS',
                    'Android'
                ]
            }
        ]
    }
}

//googlePlaces service
const googlePlaces = {
    name: 'GooglePlaces',
    protocol: 'query',
    basePath: 'https://maps.googleapis.com/maps/api/place'
}

//googlePlaces operation
const googlePlacesOperation = idService => {
    return {
        service: idService,
        name: 'nearBySearch',
        type: 'primary',
        path: '/nearbysearch/json',
        parameters: [
            {
                name: 'location',
                required: true,
                default: '-33.8670522,151.1957362',
                collectionFormat: 'csv',
                mappingCDT: [
                    'CityCoord.Latitude',
                    'CityCoord.Longitude'
                ]
            },
            {
                name: 'radius',
                required: true,
                default: '20000'
            },
            {
                name: 'type',
                required: true,
                mappingCDT: [
                    'InterestTopic'
                ],
                translate: [
                    {
                        from: 'Restaurant',
                        to: 'restaurant'
                    },
                    {
                        from: 'Museum',
                        to: 'museum'
                    }
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
                    path: 'vicinity'
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
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Museum',
            ranking: 2
        }
    ]
}

//eventful service
const eventful = {
    name: 'eventful',
    protocol: 'query',
    basePath: 'http://api.eventful.com/json'
}

//eventful operation
const eventfulOperation = idService => {
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
                name: 'date',
                required: true,
                default: 'future'
            },
            {
                name: 'where',
                required: true,
                default: '32.746682,-117.162741',
                collectionFormat: 'csv',
                mappingCDT: [
                    'CityCoord.Latitude',
                    'CityCoord.Longitude'
                ]
            },
            {
                name: 'within',
                required: true,
                default: '20'
            },
            {
                name: 'units',
                required: true,
                default: 'km'
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
            value: 'Event',
            ranking: 1
        }
    ]
}

//cinema stub service
const cinemaStub = {
    name: 'cinemaStub',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/cinema/api/v1/queryDB'
}

//cinema stub operation
const cinemaStubOperation = idService => {
    return {
        service: idService,
        name: 'search',
        type: 'primary',
        path: '/',
        parameters: [
            {
                name: 'gpspos',
                required: true,
                default: '40.83704,14.23911',
                collectionFormat: 'csv',
                mappingCDT: [
                    'CityCoord.Latitude',
                    'CityCoord.Longitude'
                ]
            },
            {
                name: 'raggio',
                required: true,
                default: '20'
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
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/milanotheater'
}

//theater stub operation
const theaterStubOperation = idService => {
    return {
        service: idService,
        name: 'search',
        type: 'primary',
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
            ranking: 1
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
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici'
}

//merici primary operation
const mericiPrimaryOperation = idService => {
    return {
        service: idService,
        name: 'search',
        type: 'primary',
        path: '/service_process.php',
        parameters: [
            {
                name: 'service',
                required: true,
                mappingCDT: [
                    'InterestTopic'
                ],
                translate: [
                    {
                        from: 'Hotel',
                        to: 'hotel'
                    },
                    {
                        from: 'Restaurant',
                        to: 'food'
                    },
                    {
                        from: 'Theater',
                        to: 'theater'
                    },
                    {
                        from: 'Museum',
                        to: 'museum'
                    }
                ]

            },
            {
                name: 'lat',
                required: true,
                default: '45.46867',
                mappingCDT: [
                    'CityCoord.Latitude'
                ]
            },
            {
                name: 'lon',
                required: true,
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
}

//merici primary service associations
const mericiPrimaryAssociations = (idCDT, idOperation) => {
    return [
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Hotel',
            ranking: 1
        },
        {
            _idOperation: idOperation,
            _idCDT: idCDT,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 3
        },
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
            dimension: 'InterestTopic',
            value: 'Museum',
            ranking: 1
        }
    ]
}

//google maps service
const googleMaps = {
    name: 'GoogleMaps',
    protocol: 'query'
}

//google maps operations
const googleMapsOperations = idService => {
    return [
        {
            service: idService,
            name: 'iOSNavigation',
            type: 'support',
            path: 'comgooglemaps://',
            storeLink: 'http://itunes.apple.com/us/app/google-maps/id585027354?mt=8',
            parameters: [
                {
                    name: 'daddr',
                    collectionFormat: 'csv',
                    mappingTerm: [
                        'latitude',
                        'longitude'
                    ]
                },
                {
                    name: 'saddr',
                    collectionFormat: 'csv',
                    mappingTerm: [
                        'devLat',
                        'devLon'
                    ]
                },
                {
                    name: 'directionsmode',
                    mappingCDT: [ 'Transport' ],
                    translate: [
                        {
                            from: 'WithCar',
                            to: 'driving'
                        },
                        {
                            from: 'PublicTransport',
                            to: 'transit'
                        }
                    ]
                }
            ]
        },
        {
            service: idService,
            name: 'AndroidNavigation',
            type: 'support',
            protocol: 'android',
            path: 'google.navigation',
            parameters: [
                {
                    name: 'q',
                    collectionFormat: 'csv',
                    mappingTerm: [
                        'latitude',
                        'longitude'
                    ]
                },
                {
                    name: 'mode',
                    mappingCDT: 'Transport',
                    translate: [
                        {
                            from: 'WithCar',
                            to: 'd'
                        },
                        {
                            from: 'PublicTransport',
                            to: 't'
                        }
                    ]
                }
            ]
        }
    ]
}

//google maps service associations
const googleMapsAssociations = (idOperationiOS, idOperationAndroid, idCDT) => {
    return [
        {
            _idOperation: idOperationiOS,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'WithCar'
        },
        {
            _idOperation: idOperationiOS,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'PublicTransport'
        },
        {
            _idOperation: idOperationiOS,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'OS',
            value: 'iOS'
        },
        {
            _idOperation: idOperationAndroid,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'WithCar'
        },
        {
            _idOperation: idOperationAndroid,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'PublicTransport'
        },
        {
            _idOperation: idOperationAndroid,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'OS',
            value: 'Android'
        }
    ]
}

//google maps service constraints
const googleMapsConstraints = (idOperationiOS, idOperationAndroid, idCDT) => {
    return [
        {
            _idOperation: idOperationiOS,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2
        },
        {
            _idOperation: idOperationAndroid,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2
        }
    ]
}

//merici support service
const mericiSupport = {
    name: 'mericiSupport',
    protocol: 'query',
    basePath: 'http://pedigree.deib.polimi.it/camus/stub/merici'
}

//merici support operation
const mericiSupportOperation = idService => {
    return {
        service: idService,
        name: 'searchTaxi',
        type: 'support',
        path: '/service_process.php',
        parameters: [
            {
                name: 'service',
                required: true,
                mappingCDT: [
                    'Typology'
                ],
                translate: [
                    {
                        from: 'Taxi',
                        to: 'taxi'
                    },
                    {
                        from: 'CarSharing',
                        to: 'carsharing'
                    },
                    {
                        from: 'WithDriver',
                        to: 'driver'
                    }
                ]

            },
            {
                name: 'lat',
                required: true,
                default: '45.46867',
                mappingTerm: [
                    'latitude'
                ]
            },
            {
                name: 'lon',
                required: true,
                default: '9.11144',
                mappingTerm: [
                    'longitude'
                ]
            }
        ]
    }
}

//merici support service associations
const mericiSupportAssociations = (idCDT, idOperation) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Typology',
            value: 'Taxi'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Typology',
            value: 'CarSharing'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Typology',
            value: 'WithDriver'
        }
    ]
}

//merici support service constraints
const mericiSupportConstraints = (idCDT, idOperation) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 1
        }
    ]
}

//apple maps service
const appleMaps = {
    name: 'AppleMaps',
    protocol: 'query'
}

//apple maps operation
const appleMapsOperation = idService => {
    return {
        service: idService,
        name: 'navigation',
        type: 'support',
        path: 'http://maps.apple.com/',
        parameters: [
            {
                name: 'll',
                collectionFormat: 'csv',
                mappingTerm: [
                    'latitude',
                    'longitude'
                ]
            },
            {
                name: 'dirflg',
                required: true,
                default: 'd'
            },
            {
                name: 't',
                required: true,
                default: 'r'
            }
        ]
    }
}

//apple maps service associations
const appleMapsAssociations = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'Transport',
            value: 'WithCar'
        },
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            dimension: 'OS',
            value: 'iOS'
        }
    ]
}

//apple maps service constraints
const appleMapsConstraints = (idOperation, idCDT) => {
    return [
        {
            _idOperation: idOperation,
            category: 'Transport',
            _idCDT: idCDT,
            constraintCount: 2
        }
    ]
}