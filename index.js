var hapi = require('hapi');
var serviceManager = require('./components/primaryServiceSelection.js');

var app = new hapi.Server();

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
 * It needs a context for service selection
 */
app.route({
    method: 'POST',
    path: '/',
    handler: function(req, reply) {
        var context = req.payload.context;
    }
});

app.start(function() {
    console.log('Server running at ' + app.info.uri);
});