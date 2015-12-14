'use strict';

let _ = require('lodash');
let Promise = require('bluebird');
let provider = require('../provider/provider.js');
let Provider = new provider();

class PrimaryServiceSelection  {

    constructor () {
        //number of services to keep
        this._n = 3;
        //filter nodes weight
        this._filterWeight = 2;
        //ranking nodes weight
        this._rankingWeight = 4;
    }

    /**
     * Search the services that best fit the current context
     * @param decoratedCdt The decorated CDT
     * @returns {bluebird|exports|module.exports} The ordered operations id
     */
    selectServices (decoratedCdt) {
        return new Promise(resolve => {
            Promise
                .props({
                    //search for services associated to the filter nodes
                    filter: Provider.filterPrimaryServices(decoratedCdt._id, decoratedCdt.filterNodes),
                    //search for services associated to the ranking nodes
                    ranking: Provider.filterPrimaryServices(decoratedCdt._id, decoratedCdt.rankingNodes),
                    //search for specific associations
                    specific: this._specificSearch(decoratedCdt._id, decoratedCdt.specificNodes)
                })
                .then(results => {
                    //merge the ranking and specific list (specific searches are considered ranking)
                    results.ranking = _.union(results.ranking, results.specific);
                    //discard the ranking nodes that haven't a correspondence in the filter nodes list
                    results.ranking = this._intersect(results.filter, results.ranking);
                    //add the weight values for each item
                    _.forEach(results.filter, i => {
                        i['weight'] = this._filterWeight;
                    });
                    _.forEach(results.ranking, i => {
                        i['weight'] = this._rankingWeight;
                    });
                    //calculate the ranking of the merged list
                    resolve(this._calculateRanking(_.union(results.filter, results.ranking)));
                })
                .catch(e => {
                    console.log(e);
                    resolve();
                });
        })
    }

    /**
     * This function dispatch the specific nodes to the correct search function.
     * It collects the results and return them to the main method
     * @param idCdt The CDT identifier
     * @param nodes The list of specific ndoes
     * @returns {bluebird|exports|module.exports} The list of associations found. Each association must be composed of an operation identifier and a ranking (starting from 1)
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
                })
                .catch(e => {
                    console.log(e);
                    resolve();
                });
        });
    }

    /**
     * Compute the ranking of each operation found by the previous steps
     * @param services The list of services, with own rank and weight
     * @returns {Array} The ranked list of Top-N services
     * @private
     */
    _calculateRanking (services) {
        let rankedList = [];
        _.forEach(services, s => {
            //calculate the ranking of the current service
            let rank;
            //avoid infinity results
            if (s.ranking > 0) {
                rank = s.weight * (1 / s.ranking);
            } else {
                rank = s.weight;
            }
            //check if the service is already in the list
            let index = _.findIndex(rankedList, i => {
                return i._idOperation.equals(s._idOperation);
            });
            if (index === -1) {
                //if not exists creates the entry
                rankedList.push({
                    _idOperation: s._idOperation,
                    rank: rank
                });
            } else {
                //if exists update the rank
                rankedList[index].rank += rank;
            }
        });
        //sort the list by the rank in descending order
        rankedList = _.sortByOrder(rankedList, 'rank', 'desc');
        //take only the first N services
        _.take(rankedList, this._n);
        return rankedList;
    }

    /**
     * Return the intersection of two arrays.
     * The base item for comparison is the Operation Identifier
     * @param array1 The first array
     * @param array2 The second array
     * @returns {Array} The array intersection of the input ones
     * @private
     */
    _intersect (array1, array2) {
        if (!_.isUndefined(array1) && !_.isUndefined(array2)) {
            let first, second;
            if (array1.length < array2.length) {
                first = array1;
                second = array2;
            } else {
                first = array2;
                second = array1;
            }
            return _.filter(first, i => {
                let index = _.findIndex(second, s => {
                    return s._idOperation.equals(i._idOperation);
                });
                return index !== -1;
            });
        }
    }

    /**
     * Search associations by coordinates.
     * It also assigns a ranking starting from the nearest service
     * @param idCdt The CDT identifier
     * @param node The node with the coordinates
     * @returns {Promise.<T>} The list of operation identifiers with ranking
     * @private
     */
    _searchByCoordinates (idCdt, node) {
        return Provider
            .searchPrimaryByCoordinates(idCdt, node)
            .map((result, index) => {
                return {
                    _idOperation: result._idOperation,
                    ranking: index + 1
                };
            });
    }
}

module.exports = PrimaryServiceSelection;