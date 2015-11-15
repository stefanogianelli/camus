/**
 * Constructor of the module
 * It initialize the list of service associations needed by the search function
 * @param data The list of service associations
 */
var searchPluginStructure = function (data) {
    this.data = data;
};

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
 * @param callback The callback function called at the end, with the list of services founded
 */
searchPluginStructure.prototype.search = function (callback) {
    //add code below
};

module.exports = searchPluginStructure;