'use strict';

import * as _ from 'lodash';
import * as async from 'async';
import * as assert from 'assert';

import * as mockData from './mockModel';
import {
    serviceModel,
    operationModel
} from '../models/mongoose/serviceDescription';
import PrimaryServiceModel from '../models/mongoose/primaryServiceAssociation';
import SupportServiceModel from '../models/mongoose/supportServiceAssociation';
import CdtModel from '../models/mongoose/cdtDescription';

let instance = null;

/**
 * MockDatabaseCreator
 */
export default class {
    
    constructor () {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    /**
     * Create a mock database for testing purposes
     * @param callback The callback function
     */
    createDatabase (callback) {
        let _idCDT;
        let _idNestedCdt;
        let _idMultipleSonsCdt;
        async.series([
                callback => {
                    let cdt = new CdtModel(mockData.cdt);
                    cdt.save((err, cdt) => {
                        _idCDT = cdt._id;
                        callback(err);
                    });
                },
                callback => {
                    let cdt = new CdtModel(mockData.nestedCdt);
                    cdt.save((err, cdt) => {
                        _idNestedCdt = cdt._id;
                        callback(err);
                    });
                },
                callback => {
                    let cdt = new CdtModel(mockData.multipleSonsCdt);
                    cdt.save((err, cdt) => {
                        _idMultipleSonsCdt = cdt._id;
                        callback(err);
                    });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let googlePlaces = new serviceModel(mockData.googlePlaces);
                                googlePlaces.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let googlePlacesOperations = new operationModel(mockData.googlePlacesOperations(idService));
                                googlePlacesOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.googlePlacesAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let eventful = new serviceModel(mockData.eventful);
                                eventful.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let eventfulOperations = new operationModel(mockData.eventfulOperations(idService));
                                eventfulOperations.save((err, operation) => {
                                    callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.eventfulAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let fakeService = new serviceModel(mockData.fakeService);
                                fakeService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let fakeServiceOperations = new operationModel(mockData.fakeServiceOperations(idService));
                                fakeServiceOperations.save((err, operation) => {
                                    callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.fakeServiceAssociation(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let testBridgeService = new serviceModel(mockData.testBridge);
                                testBridgeService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let testBridgeServiceOperations = new operationModel(mockData.testBridgeOperations(idService));
                                testBridgeServiceOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.testBridgeAssociation(idOperation, _idCDT), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let wikipediaService = new serviceModel(mockData.wikipedia);
                                wikipediaService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let wikipediaOperations = new operationModel(mockData.wikipediaOperations(idService));
                                wikipediaOperations.save(err => {
                                    callback(err);
                                });
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let googleMapsService = new serviceModel(mockData.googleMaps);
                                googleMapsService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let googleMapsOperations = new operationModel(mockData.googleMapsOperations(idService));
                                googleMapsOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.googleMapsAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let atmService = new serviceModel(mockData.atm);
                                atmService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let atmOperations = new operationModel(mockData.atmOperations(idService));
                                atmOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.atmAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let atacService = new serviceModel(mockData.atac);
                                atacService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let atacOperations = new operationModel(mockData.atacOperations(idService));
                                atacOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.atacAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let fsService = new serviceModel(mockData.fs);
                                fsService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let fsOperations = new operationModel(mockData.fsOperations(idService));
                                fsOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.fsAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let trenordService = new serviceModel(mockData.trenord);
                                trenordService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let trenordOperations = new operationModel(mockData.trenordOperations(idService));
                                trenordOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.trenordAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                },
                callback => {
                    async.waterfall([
                            callback => {
                                let flickrService = new serviceModel(mockData.flickr);
                                flickrService.save((err, service) => {
                                    callback(err, service.id);
                                });
                            },
                            (idService, callback) => {
                                let flickrOperations = new operationModel(mockData.flickrOperations(idService));
                                flickrOperations.save((err, operation) => {
                                   callback(err, operation.id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.flickrAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null);
                            }
                        ],
                        err => {
                            callback(err);
                        });
                }
            ],
            err => {
                callback(err, _idCDT, _idNestedCdt, _idMultipleSonsCdt);
            });
    }

    /**
     * Delete the created database.
     * It must be called at the end of the tests
     * @param callback The callback function
     */
    deleteDatabase (callback) {
        async.parallel([
                callback => {
                    CdtModel.remove({}, err => {
                        callback(err);
                    })
                },
                callback => {
                    PrimaryServiceModel.remove({}, err => {
                        callback(err);
                    })
                },
                callback => {
                    serviceModel.remove({}, err => {
                        callback(err);
                    })
                },
                callback => {
                    operationModel.remove({}, err => {
                        callback(err);
                    })
                },
                callback => {
                    SupportServiceModel.remove({}, err => {
                        callback(err);
                    })
                }
            ],
            err => {
                callback(err);
            });
    }
}