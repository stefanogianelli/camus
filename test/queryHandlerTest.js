var mongoose = require('mongoose');
var assert = require('assert');
var mockDatabase = require('./mockDatabaseCreator.js');
var mockData = require('./mockModel.js');
var serviceManager = require('../components/primaryServiceSelection.js');
var queryHandler = require('../components/queryHandler.js');

var db = mongoose.connection;
var idCDT = new mongoose.Types.ObjectId();
var MockDatabase = new mockDatabase(idCDT);

describe('Component: QueryHandler', function () {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err) {
            assert.equal(err, null);
            done();
        });
    });

    describe('#executeQueries()', function () {
        it('check if correct data are retrieved', function () {
            return serviceManager
                .selectServices(mockData.context(idCDT))
                .then(function(services) {
                    return queryHandler.executeQueries(services, mockData.context(idCDT).context);
                })
                .then(function (responses) {
                    assert.notEqual(responses, null);
                    assert.equal(responses.length, 2);
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