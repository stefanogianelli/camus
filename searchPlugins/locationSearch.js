var _ = require('lodash');
var Promise = require('bluebird');
var camus = require('../components/camus.js');

var locationSearch = function () { };

/**
 * Select service by the distance from the user's position.
 * It ranks the services by the lower distance
 * @param data The data from the database
 * @param node The node coming from the user
 * @returns {bluebird|exports|module.exports} The ranked list of operation identifiers
 */
locationSearch.prototype.search = function (data, node) {
    return new Promise(function (resolve, reject) {
        //add code below
        var results = [];
        _.forEach(data, function (item) {
            //calculate the distance between the two points
            var x1 = camus.getValue(item, 'Latitude');
            var x2 = camus.getValue(node, 'Latitude');
            var y1 = camus.getValue(item, 'Longitude');
            var y2 = camus.getValue(node, 'Longitude');
            var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            if (distance <= camus.getValue(item, 'Radius')) {
                results.push({
                    _idOperation: item._idOperation,
                    distance: distance
                });
            }
            //order the results by lower distance
            _.sortBy(results, 'distance', 'desc');
            //add the rank attribute
            var count = 1;
            results = _.map(results, function (item) {
               return {
                   _idOperation: item._idOperation,
                   rank: count++
               };
            });
        });
        resolve(results);
    });
};

module.exports = locationSearch;