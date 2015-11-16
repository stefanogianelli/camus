var testCustomSearch = function (data) {
    this.data = data;
};

testCustomSearch.prototype.search = function (data, callback) {
    //add code below
    callback([this.data[0]]);
};

module.exports = testCustomSearch;