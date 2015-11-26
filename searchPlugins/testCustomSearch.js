var Promise = require('bluebird');

var testCustomSearch = function () { };

testCustomSearch.prototype.search = function (data, value) {
    return new Promise(function (resolve, reject) {
        //add code below
        resolve([data[0]]);
    });
};

module.exports = testCustomSearch;