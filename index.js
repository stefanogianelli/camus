'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let graphql = require('graphql');
let graphqlHTTP = require('express-graphql');
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

//load GraphQL schemas
let schemas = require('./graphQLSchemas.js');

let app = express();

//register middleware
app.use(bodyParser.json());

/**
 * Default route
 */
app.get('/', (req, res) => {
    res.send('Hello CAMUS!');
});

/**
 * Route necessary by the mobile app to retrieve the data
 * It needs a context for Service selection
 */
app.post('/query', (req, res) => {
    ContextManager
        .getDecoratedCdt(req.body)
        .then(decoratedCdt => {
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
            res.send(response);
        })
        .catch(e => {
            res.status(500).send(e);
        });
});

/**
 * Route used for testing purpose. It deletes and recreates the database from scratch
 */
app.get('/createDatabase', (req, res) => {
    DatabaseHelper
        //first I clean the existing database
        .deleteDatabase()
        //recreate the database
        .then(() => {
            return DatabaseHelper.createDatabase();
        })
        .then(idCDT => {
            res.send('Database created!<br/>idCDT: ' + idCDT);
        })
        .catch(e => {
            res.status(500).send(e);
        });
});

/**
 * Schema for GraphQL query
 */
let schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'Query',
        fields: {
            service: {
                type: schemas.responseSchema,
                args: {
                    context: {
                        type: schemas.contextSchema
                    }
                },
                resolve: (_, context) => {
                    return ContextManager
                        .getDecoratedCdt(context.context)
                        .then(decoratedCdt => {
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
                            return response;
                        })
                        .catch(e => {
                            return e;
                        });
                }
            }
        }
    })
});

app.use('/graphql', graphqlHTTP({schema: schema, graphiql: true}));

let server = app.listen(3001, () => {
    //connect to the DB
    Provider.createConnection('mongodb://localhost/camus');

    let host = server.address().address;
    let port = server.address().port;

    console.log('Server running at http://%s:%s', host, port);
});