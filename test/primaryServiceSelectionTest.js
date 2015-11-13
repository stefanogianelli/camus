var _ = require('lodash');
var assert = require('assert');
var mongoose = require('mongoose');
var ServiceModel = require('../models/ServiceDescriptor.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var mockData = require('./mockModel.js');
var mockDatabase = require('./mockDatabaseCreator.js');

var db = mongoose.connection;
var idCDT = new mongoose.Types.ObjectId();
var MockDatabase = new mockDatabase(idCDT);

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        mongoose.connect('mongodb://localhost/camus_test');
        db.on('error', console.error.bind(console, 'connection error:'));
        //create mock services
        MockDatabase.createDatabase(function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function() {
            return serviceManager
                .selectServices(mockData.context(idCDT))
                .then(function(services) {
                    assert.notEqual(services, null);
                    ServiceModel.findByOperationId(services[0]._idOperation, function (err, data) {
                        assert.equal(data[0].name, 'GooglePlaces');
                        assert.equal(data[0].operations[0].name, 'placeTextSearch');
                    });
                });
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(function (err) {
           assert.equal(err, null);
            done();
        });
    });
});