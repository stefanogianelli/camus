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
                    console.log(data);
                });
        });
    });

    describe('#mergeCdtAndContext()', function () {
        it('check if a CDT and a context are correctly merged', function () {
            return contextManager
                .mergeCdtAndContext(mergedContext(_idCDT))
                .then(function (data) {
                    assert.equal(data.context[0].dimension, 'InterestTopic');
                    assert.equal(data.context[0].value, 'Restaurant');
                    assert.equal(data.context[1].dimension, 'Location');
                    assert.equal(data.context[1].params[0].name, 'City');
                    assert.equal(data.context[1].params[0].value, 'Milan');
                    assert.equal(data.context[1].params[0].searchFunction, 'testCustomSearch');
                });
        });
    });

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            return contextManager
                .getFilterNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 5) {
                        assert.equal(nodes[0].dimension, 'InterestTopic');
                        assert.equal(nodes[0].value, 'Restaurant');
                        assert.equal(nodes[1].dimension, 'Budget');
                        assert.equal(nodes[1].value, 'Low');
                        assert.equal(nodes[2].dimension, 'Transport');
                        assert.equal(nodes[2].value, 'PublicTransport');
                        assert.equal(nodes[3].dimension, 'Tipology');
                        assert.equal(nodes[3].value, 'DinnerWithFriends');
                        assert.equal(nodes[4].dimension, 'Number');
                        assert.equal(nodes[4].value, 4);
                    } else {
                        assert.fail(nodes.length, 5, 'Wrong nodes count');
                    }
                });

        });
        it('check error when empty context specified', function () {
            return contextManager
                .getFilterNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                .getFilterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getFilterNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getSpecificNodes()', function () {
        it('check if correct specific nodes are returned', function () {
            return contextManager
                .getSpecificNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 1) {
                        assert.equal(nodes[0].dimension, 'City');
                        assert.equal(nodes[0].value, 'Milan');
                        assert.equal(nodes[0].searchFunction, 'testCustomSearch');
                    } else {
                        assert.fail(nodes.length, 1, 'Wrong nodes count');
                    }
                });

        });
        it('check error when empty context specified', function () {
            return contextManager
                .getSpecificNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                .getSpecificNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getSpecificNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            return contextManager
                .getParameterNodes(mockData.mergedCdt(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 4) {
                        assert.equal(nodes[0].dimension, 'Budget');
                        assert.equal(nodes[0].value, 'Low');
                        assert.equal(nodes[1].dimension, 'City');
                        assert.equal(nodes[1].value, 'Milan');
                        assert.equal(nodes[2].dimension, 'Number');
                        assert.equal(nodes[2].value, 4);
                        assert.equal(nodes[3].dimension, 'search_key');
                        assert.equal(nodes[3].value, 'restaurantinnewyork');
                    } else {
                        assert.fail(nodes.length, 4, 'Wrong nodes count');
                    }
                });
        });
        it('check error when empty context specified', function () {
            return contextManager
                .getParameterNodes(emptyContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty object specified', function () {
            return contextManager
                .getParameterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getParameterNodes(wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getInterestTopic()', function () {
        it('check if correct interest topic are returned', function () {
            var interestTopic = contextManager.getInterestTopic(mockData.mergedCdt(_idCDT));
            assert.equal(interestTopic, 'Restaurant');
        });
        it('check error when sending empty context', function () {
            try {
                contextManager.getInterestTopic(emptyContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending empty object', function () {
            try {
                contextManager.getInterestTopic({ });
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending context without interest topic', function () {
            try {
                contextManager.getInterestTopic(noInterestTopicContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No interest topic selected');
            }
        });
    });

    describe('#getSupportServiceCategories()', function () {
        it('check if correct categories are returned', function () {
            return contextManager
                .getSupportServiceCategories(mockData.mergedCdt(_idCDT))
                .then(function (categories) {
                    assert.equal(categories.length, 2);
                    assert.equal(categories[0], 'Transport');
                    assert.equal(categories[1], 'Sport');
                });
        });
        it('check error when sending empty context', function () {
            return contextManager
                .getSupportServiceCategories(emptySupport(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServiceCategories({ })
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getSupportServiceNames()', function () {
        it('check if correct names are returned', function () {
            return contextManager
                .getSupportServiceNames(mockData.mergedCdt(_idCDT))
                .then(function (names) {
                    assert.notEqual(names, null);
                    assert.equal(names.length, 1);
                    assert.equal(names[0].name, 'Wikipedia');
                    assert.equal(names[0].operation, 'search');
                });
        });
        it('check error when sending empty context', function () {
            return contextManager
                .getSupportServiceNames(emptySupport(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServiceNames({ })
                .catch(function (e) {
                    assert.equal(e, 'No support services defined');
                });
        });
    });

    describe('#getDescendants()', function () {
        it('check if correct descendants are returned', function () {
            return contextManager
                .getDescendants(_idCDT, {value: 'PublicTransport'})
                .then(function (nodes) {
                    assert.notEqual(nodes, null);
                    assert.equal(nodes.length, 2);
                    assert.equal(nodes[0].dimension, 'Tipology');
                    assert.equal(nodes[0].value, 'Bus');
                    assert.equal(nodes[1].dimension, 'Tipology');
                    assert.equal(nodes[1].value, 'Train');
                });
        });
        it('check if correct nested descendants are returned', function () {
            return contextManager
                .getDescendants(_nestedCDT, {value: 'b'})
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
                .getDescendants(_multipleSonsCDT, [{value: 'd'}, {value: 'e'}])
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
                .getDescendants(_idCDT)
                .catch(function (e) {
                   assert.equal(e, 'Empty or wrong node name');
                });
        });
        it('check error with empty CDT identifier', function () {
            return contextManager
                .getDescendants()
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