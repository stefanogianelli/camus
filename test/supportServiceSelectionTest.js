var assert = require('assert');
var mongoose = require('mongoose');
var supportServiceSelection = require('../components/supportServiceSelection.js');
var mockData = require('./mockModel.js');
var mockDatabase = require('./mockDatabaseCreator.js');

var db = mongoose.connection;
var idCDT = new mongoose.Types.ObjectId();
var MockDatabase = new mockDatabase(idCDT);
var Context;

describe('Component: SupportServiceSelection', function () {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err, context) {
            assert.equal(err, null);
            Context = context;
            done();
        });
    });

    describe('#selectServices()', function () {
        it('check if correct services are selected', function () {
            return supportServiceSelection
                .selectServices(Context)
                .then(function (data) {
                    console.log(data);
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