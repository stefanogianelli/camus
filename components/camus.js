var _ = require('lodash');

var camus = function () { };

/**
 * It returns the value of the specified key, based on the format.
 * If an invalid key is provided, it returns the value of the item.
 * @param item The item
 * @param key The key
 * @returns {*} The value associated to the key if exists, the value of the item otherwise
 */
camus.prototype.getValue = function getValue (item, key) {
    if (!_.isUndefined(item.format)) {
        var attributes = item.format.split('|');
        var values = item.value.split('|');
        var index = _.findIndex(attributes, function (a) {
           return a === key;
        });
        if (index !== -1) {
            return values[index];
        } else {
            return item.value;
        }
    } else {
        return item.value;
    }
};

module.exports = new camus();