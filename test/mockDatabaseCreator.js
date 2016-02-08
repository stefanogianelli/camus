'use strict'

import async from 'async'

import * as mockData from './mockModel'
import {
    serviceModel,
    operationModel
} from '../models/mongoose/serviceDescription'
import PrimaryServiceModel from '../models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from '../models/mongoose/supportServiceAssociation'
import CdtModel from '../models/mongoose/cdtDescription'
import UserModel from '../models/mongoose/user'

let instance = null

/**
 * MockDatabaseCreator
 */
export default class {
    
    constructor () {
        if (!instance) {
            instance = this
        }
        return instance
    }

    /**
     * Create a mock database for testing purposes
     * @param callback The callback function
     */
    createDatabase (callback) {
        let _idCDT
        let _idNestedCdt
        let _idMultipleSonsCdt
        async.series([
                callback => {
                    async.waterfall([
                        callback => {
                            new UserModel(mockData.user).save((err, user) => {
                                callback(err, user.id)
                            })
                        },
                        (userId, callback) => {
                            new CdtModel(mockData.cdt(userId)).save((err, cdt) => {
                                _idCDT = cdt._id
                                callback(err, userId)
                            })
                        },
                        (userId, callback) => {
                            new CdtModel(mockData.nestedCdt(userId)).save((err, cdt) => {
                                _idNestedCdt = cdt._id
                                callback(err, userId)
                            })
                        },
                        (userId, callback) => {
                            new CdtModel(mockData.multipleSonsCdt(userId)).save((err, cdt) => {
                                _idMultipleSonsCdt = cdt._id
                                callback(err)
                            })
                        }],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.googlePlaces).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.googlePlacesOperation(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.googlePlacesAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), (a, callback) => {
                                    new PrimaryServiceModel(a).save(err => {
                                        callback(err)
                                    })
                                },
                                err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.eventful).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.eventfulOperation(idService)).save((err, operation) => {
                                    callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.eventfulAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), (a, callback) => {
                                    new PrimaryServiceModel(a).save(err => {
                                        callback(err)
                                    })
                                },
                                err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.fakeService).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.fakeServiceOperation(idService)).save((err, operation) => {
                                    callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.fakeServiceAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), (a, callback) => {
                                    new PrimaryServiceModel(a).save(err => {
                                        callback(err)
                                    })
                                },
                                err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.testBridge).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.testBridgeOperation(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.testBridgeAssociations(idOperation, _idCDT), (a, callback) => {
                                    new PrimaryServiceModel(a).save(err => {
                                        callback(err)
                                    })
                                },
                                err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.googleMaps).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.googleMapsOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.googleMapsAssociations(idOperation, _idCDT), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.googleMapsConstraint(idOperation, _idCDT)).save(err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.atm).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.atmOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.atmAssociations(idOperation, _idCDT), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.atmConstraint(idOperation, _idCDT)).save(err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.atac).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.atacOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.atacAssociations(idOperation, _idCDT), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.atacConstraint(idOperation, _idCDT)).save(err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.fs).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.fsOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.fsAssociations(idOperation, _idCDT), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.fsConstraint(idOperation, _idCDT)).save(err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.trenord).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.trenordOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.trenordAssociations(idOperation, _idCDT), (a, callback) => {
                                        new supportAssociation(a).save(err => {
                                            callback(err)
                                        })
                                    },
                                    err => {
                                        callback(err, idOperation)
                                    })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.trenordConstraint(idOperation, _idCDT)).save(err => {
                                    callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                },
                callback => {
                    async.waterfall([
                            callback => {
                                new serviceModel(mockData.flickr).save((err, service) => {
                                    callback(err, service.id)
                                })
                            },
                            (idService, callback) => {
                                new operationModel(mockData.flickrOperations(idService)).save((err, operation) => {
                                   callback(err, operation.id)
                                })
                            },
                            (idOperation, callback) => {
                                async.each(mockData.flickrAssociations(idOperation, _idCDT), (a, callback) => {
                                    new supportAssociation(a).save(err => {
                                        callback(err)
                                    })
                                },
                                err => {
                                    callback(err, idOperation)
                                })
                            },
                            (idOperation, callback) => {
                                new supportConstraint(mockData.flickrConstraint(idOperation, _idCDT)).save(err => {
                                   callback(err)
                                })
                            }
                        ],
                        err => {
                            callback(err)
                        })
                }
            ],
            err => {
                callback(err, _idCDT, _idNestedCdt, _idMultipleSonsCdt)
            })
    }

    /**
     * Delete the created database.
     * It must be called at the end of the tests
     * @param callback The callback function
     */
    deleteDatabase (callback) {
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
            ],
            err => {
                callback(err)
            })
    }
}