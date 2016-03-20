'use strict'

import async from 'async'

import * as mockData from './mockModel'
import {
    serviceModel,
    operationModel
} from '../src/models/mongoose/serviceDescription'
import PrimaryServiceModel from '../src/models/mongoose/primaryServiceAssociation'
import {
    supportAssociation,
    supportConstraint
} from '../src/models/mongoose/supportServiceAssociation'
import {
    cdtModel,
    globalCdtModel
} from '../src/models/mongoose/cdtDescription'
import UserModel from '../src/models/mongoose/user'
import {
    mashupModel,
    globalMashupModel
} from '../src/models/mongoose/mashupSchema'

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
        let _mashupId
        async.series([
                callback => {
                    async.waterfall([
                        callback => {
                            new mashupModel(mockData.globalMashup).save((err, mashup) => {
                                _mashupId = mashup._id
                                callback(err, mashup._id)
                            })
                        },
                        (mashupId, callback) => {
                            new globalMashupModel({mashupId: mashupId}).save(err => {
                                callback(err)
                            })
                        },
                        callback => {
                            new UserModel(mockData.anotherUser).save(err => {
                                callback(err)
                            })
                        },
                        callback => {
                            new UserModel(mockData.user).save((err, user) => {
                                callback(err, user.id)
                            })
                        },
                        (userId, callback) => {
                            new cdtModel(mockData.cdt(userId)).save((err, cdt) => {
                                _idCDT = cdt._id
                                callback(err, cdt._id, userId)
                            })
                        },
                        (idCdt, userId, callback) => {
                            new globalCdtModel({globalId: idCdt}).save(err => {
                                callback(err, userId)
                            })
                        },
                        (userId, callback) => {
                            new mashupModel(mockData.userMashup(userId)).save(err => {
                                callback(err, userId)
                            })
                        },
                        (userId, callback) => {
                            new cdtModel(mockData.nestedCdt(userId)).save((err, cdt) => {
                                _idNestedCdt = cdt._id
                                callback(err, userId)
                            })
                        },
                        (userId, callback) => {
                            new cdtModel(mockData.multipleSonsCdt(userId)).save((err, cdt) => {
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
                callback(err, _idCDT, _idNestedCdt, _idMultipleSonsCdt, _mashupId)
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
            ],
            err => {
                callback(err)
            })
    }
}