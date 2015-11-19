var Promise = require('bluebird');

var supportServiceSelection = function () { };

supportServiceSelection.prototype.selectServices = function () {
    return new Promise (function (resolve, reject) {

    });
};

module.exports = new supportServiceSelection();