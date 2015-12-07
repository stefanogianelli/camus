var _ = require('lodash');
var Promise = require('bluebird');

var testCustomSearch = function () { };

testCustomSearch.prototype.search = function (data, node) {
    return new Promise(function (resolve, reject) {
        //add code below
        var count = 1;
        data = _.map(_.filter(data, 'value', node.value), function (item) {
            return {
                _idOperation: item._idOperation,
                ranking: count++
            }
        });
        resolve(data);
    });
};

module.exports = testCustomSearch;