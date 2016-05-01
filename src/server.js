'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import graphqlHTTP from 'express-graphql'
import config from 'config'
import _ from 'lodash'

import {
    camusSchema
} from './models/graphql/rootSchema'

const app = express()

//register middleware
app.use(bodyParser.json())

/**
 * Default route
 */
app.get('/', (req, res) => {
    res.send('Hello CAMUS!')
})

//register the graphql endpoint
app.use('/graphql', graphqlHTTP({schema: camusSchema, graphiql: true}))

//acquire server configuration
let port = 3001
if (!_.isUndefined(process.env.PORT)) {
    port = process.env.PORT
} else if (config.has('server.port')) {
    port = config.get('server.port')
}
app.set('port', port)

//start the server
app.listen(app.get('port'), () => {
    //print the server stats
    console.log('[INFO] Server listening on port ' + port)
    const debugStatus = config.get('debug') ? 'on' : 'off'
    const metricsStatus = config.get('metrics') ? 'on' : 'off'
    console.log('[INFO] Debug is ' + debugStatus)
    console.log('[INFO] Metrics are ' + metricsStatus)
})