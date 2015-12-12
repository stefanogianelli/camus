'use strict';

let assert = require('assert');
let contextManager = require('../components/contextManager.js');
let ContextManager = new contextManager();
let mockDatabase = require('./mockDatabaseCreator.js');
let MockDatabase = new mockDatabase();
let provider = require('../provider/provider.js');
let Provider = new provider();

let _idCDT;
let _nestedCDT;
let _multipleSonsCDT;

describe('Component: ContextManager', () => {

    before(done => {
        Provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase((err, idCDT, nestedCDT, multipleSonsCDT) => {
            assert.equal(err, null);
            _idCDT = idCDT;
            _nestedCDT = nestedCDT;
            _multipleSonsCDT = multipleSonsCDT;
            done();
        });
    });

    describe('#getDecoratedCdt()', () => {
        it('check if correct decorated CDT is generated', () => {
            return ContextManager
                .getDecoratedCdt(mergedCdt(_idCDT))
                .then(data => {
                    assert.equal(data.interestTopic, 'Restaurant');
                    //filter nodes
                    assert.equal(data.filterNodes.length, 5);
                    assert.equal(data.filterNodes[0].dimension, 'InterestTopic');
                    assert.equal(data.filterNodes[0].value, 'Restaurant');
                    assert.equal(data.filterNodes[1].dimension, 'Budget');
                    assert.equal(data.filterNodes[1].value, 'Low');
                    assert.equal(data.filterNodes[2].dimension, 'Transport');
                    assert.equal(data.filterNodes[2].value, 'PublicTransport');
                    assert.equal(data.filterNodes[3].dimension, 'Tipology');
                    assert.equal(data.filterNodes[3].value, 'Bus');
                    assert.equal(data.filterNodes[4].dimension, 'Tipology');
                    assert.equal(data.filterNodes[4].value, 'Train');
                    //ranking nodes
                    assert.equal(data.rankingNodes.length, 1);
                    assert.equal(data.rankingNodes[0].dimension, 'Festivita');
                    assert.equal(data.rankingNodes[0].value, 'Capodanno');
                    //specific nodes
                    assert.equal(data.specificNodes.length, 2);
                    assert.equal(data.specificNodes[0].dimension, 'CityName');
                    assert.equal(data.specificNodes[0].value, 'Milan');
                    assert.equal(data.specificNodes[1].dimension, 'CityCoord');
                    assert.equal(data.specificNodes[1].fields[0].name, 'Longitude');
                    assert.equal(data.specificNodes[1].fields[0].value, '9.234297');
                    assert.equal(data.specificNodes[1].fields[1].name, 'Latitude');
                    assert.equal(data.specificNodes[1].fields[1].value, '45.478906');
                    //parameter nodes
                    assert.equal(data.parameterNodes.length, 4);
                    assert.equal(data.parameterNodes[0].dimension, 'Number');
                    assert.equal(data.parameterNodes[0].value, 4);
                    assert.equal(data.parameterNodes[1].dimension, 'Budget');
                    assert.equal(data.parameterNodes[1].value, 'Low');
                    assert.equal(data.parameterNodes[2].dimension, 'CityName');
                    assert.equal(data.parameterNodes[2].value, 'Milan');
                    assert.equal(data.parameterNodes[3].dimension, 'CityCoord');
                    assert.equal(data.parameterNodes[3].fields[0].name, 'Longitude');
                    assert.equal(data.parameterNodes[3].fields[0].value, '9.234297');
                    assert.equal(data.parameterNodes[3].fields[1].name, 'Latitude');
                    assert.equal(data.parameterNodes[3].fields[1].value, '45.478906');
                    //support service categories
                    assert.equal(data.supportServiceCategories.length, 1);
                    assert.equal(data.supportServiceCategories[0], 'Transport');
                    //support service names
                    assert.equal(data.supportServiceNames.length, 1);
                    assert.equal(data.supportServiceNames[0].name, 'Wikipedia');
                    assert.equal(data.supportServiceNames[0].operation, 'search');
                });
        });
    });

    describe('#mergeCdtAndContext()', () => {
        it('check if a CDT and a context are correctly merged', () => {
            return ContextManager
                ._mergeCdtAndContext(context(_idCDT))
                .then(data => {
                    assert.equal(data.context[0].dimension, 'Location');
                    assert.equal(data.context[0].for, 'ranking|parameter');
                    assert.equal(data.context[0].parameters[0].name, 'CityName');
                    assert.equal(data.context[0].parameters[0].value, 'Milan');
                    assert.equal(data.context[0].parameters[1].name, 'CityCoord');
                    assert.equal(data.context[0].parameters[1].fields[0].name, 'Longitude');
                    assert.equal(data.context[0].parameters[1].fields[0].value, '9.234297');
                    assert.equal(data.context[0].parameters[1].fields[1].name, 'Latitude');
                    assert.equal(data.context[0].parameters[1].fields[1].value, '45.478906');
                    assert.equal(data.context[1].dimension, 'InterestTopic');
                    assert.equal(data.context[1].for, 'filter');
                    assert.equal(data.context[1].value, 'Restaurant');
                });
        });
    });

    describe('#getNodes()', () => {
       it('check if correct filter nodes are returned', () => {
           return ContextManager
               ._getNodes('filter', mergedCdt(_idCDT).context, true)
               .then(results => {
                   assert.equal(results.length, 3);
                   assert.equal(results[0].dimension, 'InterestTopic');
                   assert.equal(results[0].value, 'Restaurant');
                   assert.equal(results[1].dimension, 'Budget');
                   assert.equal(results[1].value, 'Low');
                   assert.equal(results[2].dimension, 'Transport');
                   assert.equal(results[2].value, 'PublicTransport');
               });
       });
        it('check if correct ranking nodes are returned', () => {
            return ContextManager
                ._getNodes('ranking', mergedCdt(_idCDT).context, true)
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.equal(results[0].dimension, 'Festivita');
                    assert.equal(results[0].value, 'Capodanno');
                });
        });
        it('check if correct parameter nodes are returned', () => {
            return ContextManager
                ._getNodes('parameter', mergedCdt(_idCDT).context, true)
                .then(results => {
                    assert.equal(results.length, 2);
                    assert.equal(results[0].dimension, 'Number');
                    assert.equal(results[0].value, 4);
                    assert.equal(results[1].dimension, 'Budget');
                    assert.equal(results[1].value, 'Low');
                });
        });
    });

    describe('#getInterestTopic()', () => {
        it('check if correct interest topic are returned', () => {
            let interestTopic = ContextManager.constructor._getInterestTopic(mergedCdt(_idCDT));
            assert.equal(interestTopic, 'Restaurant');
        });
        it('check error when sending empty context', () => {
            try {
                ContextManager.constructor._getInterestTopic(emptyContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending empty object', () => {
            try {
                ContextManager.constructor._getInterestTopic({ });
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending context without interest topic', () => {
            try {
                ContextManager.constructor._getInterestTopic(noInterestTopicContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No interest topic selected');
            }
        });
    });

    describe('#getSupportServiceCategories()', () => {
        it('check if correct categories are returned', () => {
            return ContextManager
                ._getSupportServiceCategories(mergedCdt(_idCDT))
                .then(categories => {
                    assert.equal(categories.length, 1);
                    assert.equal(categories[0], 'Transport');
                });
        });
        it('check error when sending empty context', () => {
            return ContextManager
                ._getSupportServiceCategories(emptySupport(_idCDT))
                .catch(e => {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', () => {
            return ContextManager
                ._getSupportServiceCategories({ })
                .catch(e => {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getSupportServiceNames()', () => {
        it('check if correct names are returned', () => {
            return ContextManager
                ._getSupportServiceNames(mergedCdt(_idCDT))
                .then(names => {
                    assert.notEqual(names, null);
                    assert.equal(names.length, 1);
                    assert.equal(names[0].name, 'Wikipedia');
                    assert.equal(names[0].operation, 'search');
                });
        });
        it('check error when sending empty context', () => {
            return ContextManager
                ._getSupportServiceNames(emptySupport(_idCDT))
                .catch(e => {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', () => {
            return ContextManager
                ._getSupportServiceNames({ })
                .catch(e => {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getDescendants()', () => {
        it('check if correct descendants are returned', () => {
            return ContextManager
                ._getDescendants(_idCDT, {value: 'PublicTransport'})
                .then(nodes => {
                    assert.equal(nodes.length, 2);
                    assert.equal(nodes[0].dimension, 'Tipology');
                    assert.equal(nodes[0].value, 'Bus');
                    assert.equal(nodes[1].dimension, 'Tipology');
                    assert.equal(nodes[1].value, 'Train');
                });
        });
        it('check if correct nested descendants are returned', () => {
            return ContextManager
                ._getDescendants(_nestedCDT, {value: 'b'})
                .then(nodes => {
                    assert.equal(nodes[0].dimension, 'd');
                    assert.equal(nodes[0].value, 'e');
                    assert.equal(nodes[1].dimension, 'd');
                    assert.equal(nodes[1].value, 'f');
                    assert.equal(nodes[2].dimension, 'g');
                    assert.equal(nodes[2].value, 'h');
                    assert.equal(nodes[3].dimension, 'g');
                    assert.equal(nodes[3].value, 'i');
                });
        });
        it('check if correct multiple descendants are returned', () => {
            return ContextManager
                ._getDescendants(_multipleSonsCDT, [{value: 'd'}, {value: 'e'}])
                .then(nodes => {
                    assert.equal(nodes[0].dimension, 'g');
                    assert.equal(nodes[0].value, 'i');
                    assert.equal(nodes[1].dimension, 'g');
                    assert.equal(nodes[1].value, 'l');
                    assert.equal(nodes[2].dimension, 'h');
                    assert.equal(nodes[2].value, 'm');
                    assert.equal(nodes[3].dimension, 'h');
                    assert.equal(nodes[3].value, 'n');
                });
        });
        it('check error with empty node name', () => {
            return ContextManager
                ._getDescendants(_idCDT)
                .catch(e => {
                   assert.equal(e, 'Empty or wrong node name');
                });
        });
        it('check error with empty CDT identifier', () => {
            return ContextManager
                ._getDescendants()
                .catch(e => {
                    assert.equal(e, 'Specify a CDT identifier');
                });
        });
    });

    after(done => {
        MockDatabase.deleteDatabase(err => {
            assert.equal(err, null);
            Provider.closeConnection();
            done();
        });
    });
});

//context with no dimensions selected
let emptyContext = idCDT => {
    return {
        _id: idCDT,
        context: []
    }
};

//context with no support services selected
let emptySupport = idCDT => {
    return {
        _id: idCDT,
        support: []
    }
};

//context without interest topic
let noInterestTopicContext = idCDT => {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                parameters: [
                    {
                        name: 'City',
                        value: 'newyork'
                    }
                ]
            }
        ]
    }
};

//context used to test the merging function
let context = idCDT => {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                parameters: [
                    {
                        name: 'CityName',
                        value: 'Milan'
                    },
                    {
                        name: 'CityCoord',
                        fields: [
                            {
                                name: 'Longitude',
                                value: '9.234297'
                            },
                            {
                                name: 'Latitude',
                                value: '45.478906'
                            }
                        ]
                    },
                    {
                        name: 'caso',
                        value: 'caso'
                    }
                ]
            },
            {
                dimension: 'test',
                value: 'test'
            },
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            }
        ]
    }
};

//context used to test the decoration function
let mergedCdt = idCDT => {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                for: 'ranking|parameter',
                parameters: [
                    {
                        name: 'CityName',
                        value: 'Milan'
                    },
                    {
                        name: 'CityCoord',
                        fields: [
                            {
                                name: 'Longitude',
                                value: '9.234297'
                            },
                            {
                                name: 'Latitude',
                                value: '45.478906'
                            }
                        ]
                    }
                ]
            },
            {
                dimension: 'Festivita',
                for: 'ranking',
                value: 'Capodanno'
            },
            {
                dimension: 'InterestTopic',
                for: 'filter',
                value: 'Restaurant'
            },
            {
                dimension: 'Guests',
                for: 'parameter',
                parameters: [
                    {
                        name: 'Number',
                        value: 4
                    }
                ]
            },
            {
                dimension: 'Budget',
                for: 'filter|parameter',
                value: 'Low'
            },
            {
                dimension: 'Transport',
                for: 'filter',
                value: 'PublicTransport'
            }
        ],
        support: [
            {
                category: 'Transport'
            },
            {
                name: 'Wikipedia',
                operation: 'search'
            }
        ]
    }
};