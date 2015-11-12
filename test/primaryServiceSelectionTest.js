var assert = require('assert');
var mongoose = require('mongoose');
var ServiceDescription = require('../models/primaryServiceDescriptor.js');
var ServiceManager = require('../components/primaryServiceSelection.js');

var db = mongoose.connection;

//mock context
var context = {
    context: [
        {
            dimension: 'InterestTopic',
            value: 'Restaurant',
            for: 'filter'
        },
        {
            dimension: 'Location',
            value: 'Milan',
            for: 'filter|parameter',
            search: 'citySearch'
        },
        {
            dimension: 'Guests',
            value: '4',
            for: 'parameter'
        },
        {
            dimension: 'Budget',
            value: 'Low',
            for: 'filter|parameter'
        }
    ]
};

var service1Schema = {
    dimension: 'InterestTopic',
    value: 'Restaurant'
};

describe('Component: PrimaryServiceSelection', function() {

    before(function(done) {
        mongoose.connect('mongodb://localhost/camus_test');
        db.on('error', console.error.bind(console, 'connection error:'));
        //create mock services
        var service1 = new ServiceDescription(service1Schema);
        service1.save(function (e) {
           console.log(e);
           done();
        });
    });

    describe('#selectServices()', function() {
        it('check if correct services are selected', function(done) {
            ServiceManager
                .selectServices(context)
                .then(function(services) {
                    console.log(services);
                    done();
                });
        });
    });

    after(function (done) {
        console.log('elimino db');
        ServiceDescription.remove({}, function(err) {
            if (err) {
                console.log(err);
            }
            done();
        });
    });
});