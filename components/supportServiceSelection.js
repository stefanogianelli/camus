'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

import Provider from '../provider/provider';

const provider = new Provider();

export default class SupportServiceSelection {

    /**
     * Create the list of support services associated to the current context
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of services, with the query associated
     */
    selectServices (decoratedCdt) {
        return new Promise ((resolve, reject) => {
            Promise
                .props({
                    //acquire the URLs for the services requested by name and operation
                    servicesByName: this._selectServicesFromName(decoratedCdt.supportServiceNames),
                    //acquire the URLs for the services requested by categories
                    serviceByCategory: this._selectServiceFromCategory(decoratedCdt.supportServiceCategories, decoratedCdt)
                })
                .then(result => {
                    //return the union of the two lists
                    resolve(_.union(result.servicesByName, result.serviceByCategory));
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    /**
     * Compose the queries of services from a list of operation ids
     * @param serviceNames The list of services name and operation
     * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
     * @private
     */
    _selectServicesFromName (serviceNames) {
        return new Promise (resolve => {
            if (!_.isUndefined(serviceNames) && !_.isEmpty(serviceNames)) {
                provider
                //retrieve the service descriptions
                    .getServicesByNames(serviceNames)
                    .then(services => {
                        //compose the queries
                        resolve(this._composeQueries(services));
                    })
                    .catch(e => {
                        console.log(e);
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    /**
     * Select the services associated to a category
     * @param categories The list of categories
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The list of service objects, composed by the service name and the query associated
     * @private
     */
    _selectServiceFromCategory (categories, decoratedCdt) {
        return new Promise (resolve => {
            if (!_.isUndefined(categories) && !_.isEmpty(categories) && !_.isEmpty(decoratedCdt.filterNodes)) {
                Promise
                    .map(categories, c => {
                        return Promise
                            .join(
                                provider
                                    .filterSupportServices(decoratedCdt._id, c, _.union(decoratedCdt.filterNodes, decoratedCdt.rankingNodes)),
                                this._specificSearch(decoratedCdt._id, decoratedCdt.specificNodes),
                                (filterServices, customServices) => {
                                    return this._mergeResults(filterServices, customServices);
                                }
                            )
                            .then(services => {
                                //retrieve the service descriptions for the found operation identifiers
                                return provider.getServicesByOperationIds(services);
                            })
                            .then(services => {
                                //compose the queries
                                return this._composeQueries(services, c);
                            })
                            .catch(e => {
                                console.log(e);
                            });
                    })
                    .then(output => {
                        resolve(_.flatten(output));
                    });
            } else {
                resolve();
            }
        });
    }

    /**
     * Create the final list of support services selected for a specific category
     * @param filterServices The services found by the standard search
     * @param customServices The services found by the custom searches
     * @returns {Array} The operation identifiers of the selected support services
     * @private
     */
    _mergeResults (filterServices, customServices) {
        let results = [];
        _.forEach(_.union(filterServices, customServices), s => {
            //search if the current operation already exists in the results collection
            let index = _.findIndex(results, i => {
                return i._idOperation.equals(s._idOperation);
            });
            if (index === -1) {
                //operation not found, so I create a new object
                results.push({
                    _idOperation: s._idOperation,
                    constraintCount: s.constraintCount,
                    count: 1
                });
            } else {
                //operation found, so I increase the counter
                results[index].count += 1
            }
        });
        //get the maximum value of the count attribute
        let maxCount = _.max(_.pluck(results, 'count'));
        //filter out the operations with the maximum count value and that respect their total constraint counter
        results = _.filter(results, r => {
            return r.count === maxCount && r.constraintCount === r.count;
        });
        return _.pluck(results, '_idOperation');
    }

    /**
     * Compose the queries of the selected services
     * @param services The list of services
     * @param category (optional) The service category
     * @returns {Array} The list of services with the composed queries
     * @private
     */
    _composeQueries (services, category) {
        return _.map(services, s => {
            //configure parameters (the default ones are useful for standard query composition)
            let start = '?';
            let assign = '=';
            let separator = '&';
            //change parameter value if the service is REST
            if (s.protocol === 'rest') {
                start = assign = separator = '/';
            }
            //add the base path and the operation path to the address
            let operationsObject = {};
            if (_.isArray(s.operations)) {
                operationsObject = s.operations[0];
            } else {
                operationsObject = s.operations;
            }
            let address = s.basePath + operationsObject.path + start;
            //compose the parameters part of the query
            let output = _.reduce(operationsObject.parameters, (output, p) => {
                let values;
                if (_.isEmpty(p.mappingTerm)) {
                    //if no term is associated use the default value
                    values = p.default;
                } else {
                    // compose the values part of the parameter
                    let valueSeparator = ',';
                    //select the correct separator (the default one is the comma)
                    switch (p.collectionFormat) {
                        case 'csv':
                            valueSeparator = ',';
                            break;
                        case 'ssv':
                            valueSeparator = ' ';
                            break;
                        case 'tsv':
                            valueSeparator = '/';
                            break;
                        case 'pipes':
                            valueSeparator = '|';
                            break;
                    }
                    //concatenate one or more terms, separated by the symbol selected above
                    values = _.reduce(p.mappingTerm, (values, m) => {
                        if (_.isEmpty(values)) {
                            return m;
                        } else {
                            return values + valueSeparator + m;
                        }
                    }, '');
                    values = '{' + values + '}';
                }
                //add the value(s) to the query
                if (_.isEmpty(output)) {
                    return p.name + assign + values;
                } else {
                    return output + separator + p.name + assign + values;
                }
            }, '');
            //return the object
            if (!_.isUndefined(category) && !_.isEmpty(category)) {
                return {
                    category: category,
                    service: s.name,
                    url: address + output
                };
            } else {
                return {
                    name: s.name,
                    url: address + output
                };
            }
        });
    }

    /**
     * This function dispatch the specific nodes to the correct search function.
     * It collects the results and return them to the main method
     * @param idCdt The CDT identifier
     * @param nodes The list of specific ndoes
     * @returns {bluebird|exports|module.exports} The list of associations found. Each association must be composed of an operation identifier
     * @private
     */
    _specificSearch (idCdt, nodes) {
        return new Promise (resolve => {
            let promises = [];
            //check if the node dimension have a specific search associated
            _.forEach(nodes, node => {
                switch (node.dimension) {
                    case 'CityCoord':
                        //load specific coordinates search
                        promises.push(this._searchByCoordinates(idCdt, node));
                        break;
                }
            });
            Promise
                .all(promises)
                .then(results => {
                    resolve(_.flatten(results));
                });
        });
    }

    /**
     * Search associations by coordinates.
     * @param idCdt The CDT identifier
     * @param node The node with the coordinates
     * @returns {Promise.<T>} The list of operation identifiers
     * @private
     */
    _searchByCoordinates (idCdt, node) {
        return provider
            .searchSupportByCoordinates(idCdt, node)
            .catch(e => {
                console.log(e);
            });
    }
}