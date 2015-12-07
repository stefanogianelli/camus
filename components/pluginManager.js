var _ = require('lodash');
var Promise = require('bluebird');
var Interface = require('./interfaceChecker.js');

//every search plugin must implement the method 'search'
var searchPluginInterface = new Interface('searchPluginInterface', ['search']);

var pluginManager = function () { };

/**
 * Executes all the specific search modules
 * @param nodes The list of nodes that need a specific search function
 * @param data The service association list for the current CDT
 * @returns {bluebird|exports|module.exports} The list of services selected
 */
pluginManager.prototype.executeModules = function (nodes, data) {
    return new Promise(function (resolve, reject) {
        var services = [];
        var promises = [];
        _.forEach(nodes, function (n) {
            try {
                //select the association data associated to the currently analyzed dimension
                var filter = _.filter(data, {dimension: n.dimension});
                if (!_.isEmpty(filter)) {
                    //load the module
                    var module = require('../searchPlugins/' + n.searchFunction + ".js");
                    //check that the module implements the search plugin interface
                    Interface.ensureImplements(module, searchPluginInterface);
                    //initialize the module
                    var Module = new module();
                    //launch the search function with the associated data and the value obtained by the decorated CDT
                    promises.push(
                        Module
                            .search(filter, n)
                            .then(function (results) {
                                if (!_.isUndefined(results) && _.isArray(results) && !_.isEmpty(results)) {
                                    services = _.union(services, results);
                                }
                            })
                    );
                }
            } catch (e) {
                console.log(e.message);
            }
        });
        Promise
            .all(promises)
            .then(function () {
                resolve(services);
            })
            .catch(function (e) {
                reject(e);
            });
    });
};

module.exports = new pluginManager();