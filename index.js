require('babel-register')
require('babel-polyfill')
if (process.env.NEW_RELIC_LICENSE_KEY !== undefined && process.env.NEW_RELIC_APP_NAME !== undefined) {
    require('newrelic')
}
require('./src/server')