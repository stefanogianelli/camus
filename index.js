var hapi = require('hapi');

var app = new hapi.Server();

app.connection({
    host: 'localhost',
    port: 3001
});

app.route({
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
        reply('Hello CAMUS!');
    }
});

app.start(function() {
    console.log('Server running at ' + app.info.uri);
});