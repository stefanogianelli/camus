var assert = require('assert');
var async = require('async');
var mongoose = require('mongoose');
var PrimaryServiceModel = require('../models/primaryServiceDescriptor.js');
var ServiceModel = require('../models/ServiceDescriptor.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var mockData = require('./mockModel.js');

var db = mongoose.connection;

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        mongoose.connect('mongodb://localhost/camus_test');
        db.on('error', console.error.bind(console, 'connection error:'));
        //create mock services
        async.waterfall([
            function (callback) {
                var service1 = new ServiceModel(mockData.service1);
                service1.save(function (err, service) {
                    assert.equal(err, null);
                    console.log(service);
                    callback(null, service.operations[0].id);
                });
            },
            function (idOperation, callback) {
                var primaryService1 = new PrimaryServiceModel(mockData.primaryService1(idOperation));
                primaryService1.save(function (err) {
                    assert.equal(err, null);
                    callback(err, 'done');
                });
            }
        ],
        function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function() {
            return serviceManager
                .selectServices(mockData.context)
                .then(function(services) {
                    assert.notEqual(services, null);
                    console.log(services);
                });
        });
    });

    after(function (done) {
        async.parallel({
            one: function (callback) {
                PrimaryServiceModel.remove({}, function(err) {
                    assert.equal(err, null);
                    callback(err, 'done');
                })
            },
            two: function (callback) {
                ServiceModel.remove({}, function(err) {
                    assert.equal(err, null);
                    callback(err, 'done');
                })
            }
        },
        function (err) {
            if (err) {
                console.log(err);
            }
            done();
        });
    });
});