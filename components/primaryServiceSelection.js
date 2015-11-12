var _ = require('lodash');
var contextManager = require('./contextManager.js');

function primaryServiceSelection (mongoose) {
    this.mongoose = mongoose;
}

module.exports = primaryServiceSelection;