var assert = require('assert');
var contextManager = require('../components/contextManager.js');
var mockData = require('./mockModel.js');
var MockDatabase = require('./mockDatabaseCreator.js');
var provider = require('../provider/provider.js');

var _idCDT;
var _nestedCDT;
var _multipleSonsCDT;

describe('Component: ContextManager', function() {

    before(function(done) {
        provider.createConnection('mongodb://localhost/camus_test');
        MockDatabase.createDatabase(function (err, idCDT, nestedCDT, multipleSonsCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            _nestedCDT = nestedCDT;
            _multipleSonsCDT = multipleSonsCDT;
            done();
        });
    });

    describe('#getDecoratedCdt()', function () {
        it('check if correct decorated CDT is generated', function () {
            return contextManager
                .getDecoratedCdt(decoratedContext(_idCDT))
                .then(function (data) {
                    assert.equal(data.interestTopic, 'Restaurant');
                    assert.equal(data.filterNodes[0].dimension, 'InterestTopic');
                    assert.equal(data.filterNodes[0].value, 'Restaurant');
                    assert.equal(data.filterNodes[1].dimension, 'Budget');
                    assert.equal(data.filterNodes[1].value, 'Low');
                    assert.equal(data.filterNodes[2].dimension, 'Transport');
                    assert.equal(data.filterNodes[2].value, 'PublicTransport');
                    assert.equal(data.filterNodes[3].dimension, 'Ora');
                    assert.equal(data.filterNodes[3].value, '20:00');
                    assert.equal(data.filterNodes[4].dimension, 'Tipology');
                    assert.equal(data.filterNodes[4].value, 'Bus');
                    assert.equal(data.filterNodes[5].dimension, 'Tipology');
                    assert.equal(data.filterNodes[5].value, 'Train');
                    assert.equal(data.rankingNodes[0].dimension, 'Festivita');
                    assert.equal(data.rankingNodes[0].value, 'Capodanno');
                    assert.equal(data.rankingNodes[1].dimension, 'City');
                    assert.equal(data.rankingNodes[1].value, 'Milan');
                    assert.equal(data.parameterNodes[0].dimension, 'Budget');
                    assert.equal(data.parameterNodes[0].value, 'Low');
                    assert.equal(data.parameterNodes[1].dimension, 'City');
                    assert.equal(data.parameterNodes[1].value, 'Milan');
                    assert.equal(data.parameterNodes[2].dimension, 'Number');
                    assert.equal(data.parameterNodes[2].value, 4);
                    assert.equal(data.supportServiceCategories[0], 'Transport');
                    assert.equal(data.supportServiceNames[0].name, 'Wikipedia');
                    assert.equal(data.supportServiceNames[0].operation, 'search');
                });
        });
    });

    describe('#mergeCdtAndContext()', function () {
        it('check if a CDT and a context are correctly merged', function () {
            return contextManager
                ._mergeCdtAndContext(mergedContext(_idCDT))
                .then(function (data) {
                    assert.equal(data.context[0].dimension, 'InterestTopic');
                    assert.equal(data.context[0].value, 'Restaurant');
                    assert.equal(data.context[1].dimension, 'Location');
                    assert.equal(data.context[1].params[0].name, 'City');
                    assert.equal(data.context[1].params[0].value, 'Milan');
                });
        });
    });

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            return contextManager
                ._getFilterNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    assert.equal(nodes.length, 6);
                    assert.equal(nodes[0].dimension, 'InterestTopic');
                    assert.equal(nodes[0].value, 'Restaurant');
                    assert.equal(nodes[1].dimension, 'Budget');
                    assert.equal(nodes[1].value, 'Low');
                    assert.equal(nodes[2].dimension, 'Transport');
                    assert.equal(nodes[2].value, 'PublicTransport');
                    assert.equal(nodes[3].dimension, 'Tipology');
                    assert.equal(nodes[3].value, 'DinnerWithFriends');
                    assert.equal(nodes[4].dimension, 'Ora');
                    assert.equal(nodes[4].value, '20:00');
                    assert.equal(nodes[5].dimension, 'Number');
                    assert.equal(nodes[5].value, 4);
                });

        });
        it('check error when empty context specified', function () {
            return contextManager
                ._getFilterNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                ._getFilterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                ._getFilterNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getRankingNodes()', function () {
        it('check if correct ranking nodes are returned', function () {
            return contextManager
                ._getRankingNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    assert.equal(nodes.length, 2);
                    assert.equal(nodes[0].dimension, 'Festivita');
                    assert.equal(nodes[0].value, 'Capodanno');
                    assert.equal(nodes[1].dimension, 'City');
                    assert.equal(nodes[1].value, 'Milan');
                });

        });
        it('check error when empty context specified', function () {
            return contextManager
                ._getRankingNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                ._getRankingNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                ._getRankingNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            return contextManager
                ._getParameterNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    assert.equal(nodes.length, 4);
                    assert.equal(nodes[0].dimension, 'Budget');
                    assert.equal(nodes[0].value, 'Low');
                    assert.equal(nodes[1].dimension, 'City');
                    assert.equal(nodes[1].value, 'Milan');
                    assert.equal(nodes[2].dimension, 'Number');
                    assert.equal(nodes[2].value, 4);
                    assert.equal(nodes[3].dimension, 'search_key');
                    assert.equal(nodes[3].value, 'restaurantinnewyork');
                });
        });
        it('check error when empty context specified', function () {
            return contextManager
                ._getParameterNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                ._getParameterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                ._getParameterNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getInterestTopic()', function () {
        it('check if correct interest topic are returned', function () {
            var interestTopic = contextManager._getInterestTopic(mockData.mergedCdt(_idCDT));
            assert.equal(interestTopic, 'Restaurant');
        });
        it('check error when sending empty context', function () {
            try {
                contextManager._getInterestTopic(emptyContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending empty object', function () {
            try {
                contextManager._getInterestTopic({ });
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending context without interest topic', function () {
            try {
                contextManager._getInterestTopic(noInterestTopicContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No interest topic selected');
            }
        });
    });

    describe('#getSupportServiceCategories()', function () {
        it('check if correct categories are returned', function () {
            return contextManager
                ._getSupportServiceCategories(mockData.mergedCdt(_idCDT))
                .then(function (categories) {
                    assert.equal(categories.length, 2);
                    assert.equal(categories[0], 'Transport');
                    assert.equal(categories[1], 'Sport');
                });
        });
        it('check error when sending empty context', function () {
            return contextManager
                ._getSupportServiceCategories(emptySupport(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                ._getSupportServiceCategories({ })
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getSupportServiceNames()', function () {
        it('check if correct names are returned', function () {
            return contextManager
                ._getSupportServiceNames(mockData.mergedCdt(_idCDT))
                .then(function (names) {
                    assert.notEqual(names, null);
                    assert.equal(names.length, 1);
                    assert.equal(names[0].name, 'Wikipedia');
                    assert.equal(names[0].operation, 'search');
                });
        });
        it('check error when sending empty context', function () {
            return contextManager
                ._getSupportServiceNames(emptySupport(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                ._getSupportServiceNames({ })
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getDescendants()', function () {
        it('check if correct descendants are returned', function () {
            return contextManager
                ._getDescendants(_idCDT, {value: 'PublicTransport'})
                .then(function (nodes) {
                    assert.equal(nodes.length, 2);
                    assert.equal(nodes[0].dimension, 'Tipology');
                    assert.equal(nodes[0].value, 'Bus');
                    assert.equal(nodes[1].dimension, 'Tipology');
                    assert.equal(nodes[1].value, 'Train');
                });
        });
        it('check if correct nested descendants are returned', function () {
            return contextManager
                ._getDescendants(_nestedCDT, {value: 'b'})
                .then(function (nodes) {
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
        it('check if correct multiple descendants are returned', function () {
            return contextManager
                ._getDescendants(_multipleSonsCDT, [{value: 'd'}, {value: 'e'}])
                .then(function (nodes) {
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
        it('check error with empty node name', function () {
            return contextManager
                ._getDescendants(_idCDT)
                .catch(function (e) {
                   assert.equal(e, 'Empty or wrong node name');
                });
        });
        it('check error with empty CDT identifier', function () {
            return contextManager
                ._getDescendants()
                .catch(function (e) {
                    assert.equal(e, 'Specify a CDT identifier');
                });
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(function (err) {
            assert.equal(err, null);
            provider.closeConnection();
            done();
        });
    });
});

//wrong context
var wrongContext = function(idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            }
        ]
    }
};

//context with no dimensions selected
var emptyContext = function (idCDT) {
    return {
        _id: idCDT,
        context: []
    }
};

//context with no support services selected
var emptySupport = function (idCDT) {
    return {
        _id: idCDT,
        support: []
    }
};

//context without interest topic
var noInterestTopicContext = function (idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                params: [
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
var mergedContext = function (idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                params: [
                    {
                        name: 'City',
                        value: 'Milan'
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
var decoratedContext = function (idCDT) {
    return {
        _id: idCDT,
        context: [
            {
                dimension: 'Location',
                params: [
                    {
                        name: 'City',
                        value: 'Milan'
                    }
                ]
            },
            {
                dimension: 'Festivita',
                for: 'ranking',
                value: 'Capodanno'
            },
            {
                dimension: 'Apertura',
                for: 'filter',
                params: [
                    {
                        name: 'Ora',
                        value: '20:00'
                    }
                ]
            },
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Guests',
                params: [
                    {
                        name: 'Number',
                        value: 4
                    }
                ]
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'Transport',
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