var Promise = require('bluebird');

var translationManager = function () { };

/**
 * Translator function for the budget dimension
 * @param interestTopic The interest topic selected
 * @param value The selected budget
 * @returns {bluebird|exports|module.exports} The translated value
 */
translationManager.prototype.translateBudget = function(interestTopic, value) {
    return new Promise (function (resolve, reject) {
        switch (interestTopic) {
            case 'Restaurant':
                if (value === 'Low') {
                    resolve(10);
                } else if (value === 'Medium') {
                    resolve(30);
                } else if (value === 'High') {
                    resolve(50);
                } else {
                    reject('translateBudget: invalid value');
                }
                break;
            default:
                reject('translateBudget: invalid interest topic');
                break;
        }
    });
};

module.exports = new translationManager();