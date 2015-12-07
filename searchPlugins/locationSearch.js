var _ = require('lodash');
var Promise = require('bluebird');
var camus = require('../components/camus.js');

var locationSearch = function () { };

locationSearch.prototype.search = function (data, node) {
    return new Promise(function (resolve, reject) {
        //add code below
        var count = 1;
        var result = [];
        _.forEach(data, function (item) {
            //calculate the distance between the two points
            var x1 = camus.getValue(item, 'Latitude');
            var x2 = camus.getValue(node, 'Latitude');
            var y1 = camus.getValue(item, 'Longitude');
            var y2 = camus.getValue(node, 'Longitude');
            var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            if (distance <= camus.getValue(item, 'Radius')) {
                result.push({
                    _idOperation: item._idOperation,
                    ranking: count++
                });
            }
        });
        resolve(result);
    });
};

module.exports = locationSearch;