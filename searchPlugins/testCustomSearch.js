var _ = require('lodash');
var Promise = require('bluebird');

var testCustomSearch = function () { };

testCustomSearch.prototype.search = function (data, value) {
    return new Promise(function (resolve, reject) {
        //add code below
        resolve(_.filter(data, 'value', value));
    });
};

module.exports = testCustomSearch;