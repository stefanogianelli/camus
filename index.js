var hapi = require('hapi');
var Promise = require('bluebird');
var provider = require('./provider/provider.js');

//components
var contextManager = require('./components/contextManager.js');
var primaryService = require('./components/primaryServiceSelection.js');
var queryHandler = require('./components/queryHandler.js');
var supportService = require('./components/supportServiceSelection.js');
var responseAggregator = require('./components/responseAggregator.js');

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
 * It needs a context for Service selection
 */
app.route({
    method: 'POST',
    path: '/query',
    handler: function(req, reply) {
        contextManager
            .getDecoratedCdt(req.payload)
            .then(function (decoratedCdt) {
                return Promise
                    .props({
                        primary: primaryService
                            .selectServices(decoratedCdt)
                            .then(function (services) {
                                return queryHandler
                                    .executeQueries(services, decoratedCdt);
                            }),
                        support: supportService.selectServices(decoratedCdt)
                    });
            })
            .then(function (result) {
                return responseAggregator
                    .prepareResponse(result.primary, result.support);
            })
            .then(function (response) {
                reply(response);
            });
    }
});

app.start(function() {
    provider.createConnection('mongodb://localhost/camus');
    console.log('Server running at ' + app.info.uri);
});