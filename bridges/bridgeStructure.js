var Promise = require('bluebird');

var bridgeStructure = function () { };

/**
 * It allows to execute custom queries to web service
 * @param parameterNodes The paramater nodes retrieved from the current context
 * These parameters respect this structure:
 * {
 *    name: the CDT dimension node name
 *    value: the value choosen by the user or acquired by the phone sensors
 * }
 * @returns {bluebird|exports|module.exports} The response provided by the service, in JSON format
 */
bridgeStructure.prototype.executeQuery = function (parameterNodes) {
  return new Promise (function (resolve, reject) {
      //add code below
  });
};

module.exports = new bridgeStructure();