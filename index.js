var hapi = require('hapi');
var mongoose = require('mongoose');
var primaryService = require('./components/primaryServiceSelection.js');

var app = new hapi.Server();
var db = mongoose.connection;

app.connection({
    host: 'localhost',
    port: 3001
});

/**
 * Default route
 */
app.route({
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply('Hello CAMUS!');
    }
});

/**
 * Route necessary by the mobile app to retrieve the data
 * It needs a context for Service selection
 */
app.route({
    method: 'POST',
    path: '/query',
    handler: function(req, reply) {
        primaryService
            .selectServices(req.payload)
            .then(function (services) {
               console.log(services);
            });
        reply(req.payload);
    }
});

app.start(function() {
    mongoose.connect('mongodb://localhost/camus');
    db.on('error', console.error.bind(console, 'connection error:'));
    console.log('Server running at ' + app.info.uri);
});