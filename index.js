var hapi = require('hapi');
var Promise = require('bluebird');
var provider = require('./provider/provider.js');

//components
var contextManager = require('./components/contextManager.js');
var primaryService = require('./components/primaryServiceSelection.js');
var queryHandler = require('./components/queryHandler.js');
var supportService = require('./components/supportServiceSelection.js');
var responseAggregator = require('./components/responseAggregator.js');
var databaseHelper = require('./databaseHelper.js');

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
            .mergeCdtAndContext(req.payload)
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
                return responseAggregator.prepareResponse(result.primary, result.support);
            })
            .then(function (response) {
                reply(response);
            })
            .catch(function (e) {
                reply(e);
            });
    }
});

/**
 * Route used for testing purpose. It deletes and recreates the database from scratch
 */
app.route({
    method: 'GET',
    path: '/createDatabase',
    handler: function (req, reply) {
        databaseHelper
            //first I clean the existing database
            .deleteDatabase()
            //recreate the database
            .then(function () {
                return databaseHelper.createDatabase();
            })
            .then(function (idCDT) {
                reply('Database created!<br/>idCDT: ' + idCDT);
            })
            .catch(function (e) {
                reply(e);
            });
    }
});

app.start(function() {
    provider.createConnection('mongodb://localhost/camus');
    console.log('Server running at ' + app.info.uri);
});