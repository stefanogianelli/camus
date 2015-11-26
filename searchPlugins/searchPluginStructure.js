var Promise = require('bluebird');

/**
 * Constructor of the module
 */
var searchPluginStructure = function () { };

/**
 * The main search function
 * Write the code below the commented line
 * This function must return a list of items found
 * Each items must have this structure:
 * {
 *   _idOperation: ObjectId,
 *   ranking: Number,
 *   weight: Number
 * }
 * You can return an array by using resolve(array) or return an error by reject('error message')
 * @param data The association data for the current dimension
 * @param value The value obtained from the context
 */
searchPluginStructure.prototype.search = function (data, value) {
    return new Promise(function (resolve, reject) {
        //add code below
    });
};

module.exports = searchPluginStructure;