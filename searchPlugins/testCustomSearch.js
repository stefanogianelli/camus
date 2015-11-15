var testCustomSearch = function (data) {
    this.data = data;
};

testCustomSearch.prototype.search = function (callback) {
    callback([this.data[0]]);
};

module.exports = testCustomSearch;