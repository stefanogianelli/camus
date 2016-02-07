'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import graphqlHTTP from 'express-graphql';
import config from 'config';
import _ from 'lodash';

import DatabaseHelper from'./databaseHelper';
import Provider from './provider/provider';

import {
    camusSchema
} from './models/graphql/rootSchema';

import {
    prepareResponse
} from './components/executionHelper';

const provider = new Provider();
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
 * @deprecated
 */
app.post('/query', (req, res) => {
    prepareResponse(req.body)
        .then(response => {
            res.send(response);
        })
        .catch(e => {
            console.log('[ERROR] ' + e);
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

//register the graphql endpoint
app.use('/graphql', graphqlHTTP({schema: camusSchema, graphiql: true}));

//acquire server configuration
let port = 3001;
if (!_.isUndefined(process.env.PORT)) {
    port = process.env.PORT;
} else if (config.has('server.port')) {
    port = config.get('server.port');
}
app.set('port', port);

let dbUrl = '';
if (!_.isUndefined(process.env.MONGOLAB_URI)) {
    dbUrl = process.env.MONGOLAB_URI;
} else if (config.has('database.address')) {
    dbUrl = config.get('database.address');
} else {
    throw Error('[ERROR] No database URL defined in the config file!');
}

//start the server
let server = app.listen(app.get('port'), () => {
    //connect to the DB
    provider.createConnection(dbUrl);
    //print the server stats
    console.log('[INFO] Server listening on port ' + port);
});