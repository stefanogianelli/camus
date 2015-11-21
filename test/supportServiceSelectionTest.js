var assert = require('assert');
var mongoose = require('mongoose');
var supportServiceSelection = require('../components/supportServiceSelection.js');
var mockData = require('./mockModel.js');
var MockDatabase = require('./mockDatabaseCreator.js');

var db = mongoose.connection;
var _idCDT;

describe('Component: SupportServiceSelection', function () {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err, idCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#selectServices()', function () {
        it('check if correct services are selected', function () {
            return supportServiceSelection
                .selectServices(mockData.context(_idCDT))
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