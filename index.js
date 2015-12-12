'use strict';

let hapi = require('hapi');
let Promise = require('bluebird');
let provider = require('./provider/provider.js');
let Provider = new provider();

//components
let contextManager = require('./components/contextManager.js');
let ContextManager = new contextManager();
let primaryService = require('./components/primaryServiceSelection.js');
let PrimaryService = new primaryService();
let queryHandler = require('./components/queryHandler.js');
let QueryHandler = new queryHandler();
let supportService = require('./components/supportServiceSelection.js');
let SupportService = new supportService();
let responseAggregator = require('./components/responseAggregator.js');
let ResponseAggregator = new responseAggregator();
let databaseHelper = require('./databaseHelper.js');
let DatabaseHelper = new databaseHelper();

let app = new hapi.Server();

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
    handler: (req, reply) => {
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
    handler: (req, reply) => {
        ContextManager
            .getDecoratedCdt(req.payload)
            .then(decoratedCdt =>{
                return Promise
                    .props({
                        primary: PrimaryService
                            .selectServices(decoratedCdt)
                            .then(services => {
                                return QueryHandler
                                    .executeQueries(services, decoratedCdt);
                            }),
                        support: SupportService.selectServices(decoratedCdt)
                    });
            })
            .then(result => {
                return ResponseAggregator.prepareResponse(result.primary, result.support);
            })
            .then(response => {
                reply(response);
            })
            .catch(e => {
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
    handler: (req, reply) => {
        DatabaseHelper
            //first I clean the existing database
            .deleteDatabase()
            //recreate the database
            .then(() => {
                return DatabaseHelper.createDatabase();
            })
            .then(idCDT => {
                reply('Database created!<br/>idCDT: ' + idCDT);
            })
            .catch(e => {
                reply(e);
            });
    }
});

app.start(() => {
    Provider.createConnection('mongodb://localhost/camus');
    console.log('Server running at ' + app.info.uri);
});