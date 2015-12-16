'use strict';

import * as _ from 'lodash';
import * as async from 'async';
import * as assert from 'assert';

import * as mockData from './mockModel.js';
import ServiceModel from '../models/serviceDescription.js';
import PrimaryServiceModel from '../models/primaryServiceAssociation.js';
import SupportServiceModel from '../models/supportServiceAssociation.js';
import CdtModel from '../models/cdtDescription.js';

let instance = null;

export default class MockDatabaseCreator {
    
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
        async.series({
                one: callback => {
                    let cdt = new CdtModel(mockData.cdt);
                    cdt.save((err, cdt) => {
                        _idCDT = cdt._id;
                        callback(err, 'done');
                    });
                },
                two: callback => {
                    let cdt = new CdtModel(mockData.nestedCdt);
                    cdt.save((err, cdt) => {
                        _idNestedCdt = cdt._id;
                        callback(err, 'done');
                    });
                },
                three: callback => {
                    let cdt = new CdtModel(mockData.multipleSonsCdt);
                    cdt.save((err, cdt) => {
                        _idMultipleSonsCdt = cdt._id;
                        callback(err, 'done');
                    });
                },
                four: callback => {
                    async.waterfall([
                            callback => {
                                let googlePlaces = new ServiceModel(mockData.googlePlaces);
                                googlePlaces.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.googlePlacesAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                five: callback => {
                    async.waterfall([
                            callback => {
                                let eventful = new ServiceModel(mockData.eventful);
                                eventful.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.eventfulAssociations(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                six: callback => {
                    async.waterfall([
                            callback => {
                                let fakeService = new ServiceModel(mockData.fakeService);
                                fakeService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.fakeServiceAssociation(idOperation, _idCDT, _idNestedCdt, _idMultipleSonsCdt), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                seven: callback => {
                    async.waterfall([
                            callback => {
                                let testBridgeService = new ServiceModel(mockData.testBridge);
                                testBridgeService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.testBridgeAssociation(idOperation, _idCDT), a => {
                                    let associations = new PrimaryServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                eight: callback => {
                    async.waterfall([
                            callback => {
                                let wikipediaService = new ServiceModel(mockData.wikipedia);
                                wikipediaService.save((err, service) => {
                                    callback(err, 'done');
                                });
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                nine: callback => {
                    async.waterfall([
                            callback => {
                                let googleMapsService = new ServiceModel(mockData.googleMaps);
                                googleMapsService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.googleMapsAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                ten: callback => {
                    async.waterfall([
                            callback => {
                                let atmService = new ServiceModel(mockData.atm);
                                atmService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.atmAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                eleven: callback => {
                    async.waterfall([
                            callback => {
                                let atacService = new ServiceModel(mockData.atac);
                                atacService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.atacAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                twelve: callback => {
                    async.waterfall([
                            callback => {
                                let fsService = new ServiceModel(mockData.fs);
                                fsService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.fsAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                thirteen: callback => {
                    async.waterfall([
                            callback => {
                                let trenordService = new ServiceModel(mockData.trenord);
                                trenordService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.trenordAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                },
                fourteen: callback => {
                    async.waterfall([
                            callback => {
                                let flickrService = new ServiceModel(mockData.flickr);
                                flickrService.save((err, service) => {
                                    callback(err, service.operations[0].id);
                                });
                            },
                            (idOperation, callback) => {
                                _.forEach(mockData.flickrAssociation(idOperation, _idCDT), a => {
                                    let associations = new SupportServiceModel(a);
                                    associations.save(err => {
                                        assert.equal(err, null);
                                    });
                                });
                                callback(null, 'done');
                            }
                        ],
                        err => {
                            callback(err, 'done');
                        });
                }
            },
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
        async.parallel({
                zero: callback => {
                    CdtModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                one: callback => {
                    PrimaryServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                two: callback => {
                    ServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                },
                three: callback => {
                    SupportServiceModel.remove({}, err => {
                        callback(err, 'done');
                    })
                }
            },
            err => {
                callback(err, 'done');
            });
    }
}