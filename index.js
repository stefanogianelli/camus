'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import graphqlHTTP from 'express-graphql';
import Promise from 'bluebird';

import ContextManager from'./components/contextManager';
import PrimaryService from'./components/primaryServiceSelection';
import QueryHandler from'./components/queryHandler';
import SupportService from'./components/supportServiceSelection';
import ResponseAggregator from'./components/responseAggregator';
import DatabaseHelper from'./databaseHelper';
import Provider from './provider/provider';
import camusSchema from './models/graphql/graphQLSchemas';

const provider = new Provider();
const contextManager = new ContextManager();
const primaryService = new PrimaryService();
const queryHandler = new QueryHandler();
const supportService = new SupportService();
const responseAggregator = new ResponseAggregator();
const databaseHelper = new DatabaseHelper();

const app = express();

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
    contextManager
        .getDecoratedCdt(req.body)
        .then(decoratedCdt => {
            return Promise
                .props({
                    primary: primaryService
                        .selectServices(decoratedCdt)
                        .then(services => {
                            return queryHandler
                                .executeQueries(services, decoratedCdt);
                        }),
                    support: supportService.selectServices(decoratedCdt)
                });
        })
        .then(result => {
            return responseAggregator.prepareResponse(result.primary, result.support);
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
    databaseHelper
        //first I clean the existing database
        .deleteDatabase()
        //recreate the database
        .then(() => {
            return databaseHelper.createDatabase();
        })
        .then(idCDT => {
            res.send('Database created!<br/>idCDT: ' + idCDT);
        })
        .catch(e => {
            res.status(500).send(e);
        });
});

//register graphql endpoint
app.use('/graphql', graphqlHTTP({schema: camusSchema, graphiql: true}));

//start the server
let server = app.listen(3001, () => {
    //connect to the DB
    provider.createConnection('mongodb://localhost/camus');

    let host = server.address().address;
    const port = server.address().port;
    if (host === '::') {
        host = 'localhost';
    }

    console.log('Server running at http://%s:%s', host, port);
});