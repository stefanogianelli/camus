var Promise = require('bluebird');
var camus = require('../components/camus.js');

/**
 * Constructor of the module
 */
var searchPluginStructure = function () { };

/**
 * The main search function
 * Write the code below the commented line
 * This function must return a list of items found, ranked from 1.
 * Each items must have this structure:
 * {
 *   _idOperation: ObjectId,
 *   ranking: Number
 * }
 * It's possible to access to composite parameter with the function camus.getValue(item, key).
 * You can return an array by using resolve(array) or return an error by reject('error message')
 * @param data The association data for the current dimension
 * @param node The node obtained from the context
 */
searchPluginStructure.prototype.search = function (data, node) {
    return new Promise(function (resolve, reject) {
        //add code below
    });
};

module.exports = searchPluginStructure;