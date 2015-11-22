var assert = require('assert');
var mongoose = require('mongoose');
var contextManager = require('../components/contextManager.js');
var mockData = require('./mockModel.js');
var MockDatabase = require('./mockDatabaseCreator.js');

var db = mongoose.connection;

var _idCDT;

describe('Component: ContextManager', function() {

    before(function(done) {
        if (!db.db) {
            mongoose.connect('mongodb://localhost/camus_test');
            db.on('error', console.error.bind(console, 'connection error:'));
        }
        MockDatabase.createDatabase(function (err, idCDT) {
            assert.equal(err, null);
            _idCDT = idCDT;
            done();
        });
    });

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            return contextManager
                .getFilterNodes(mockData.context(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 4) {
                        assert.equal(nodes[0].dimension, 'InterestTopic');
                        assert.equal(nodes[0].value, 'Restaurant');
                        assert.equal(nodes[1].dimension, 'Location');
                        assert.equal(nodes[1].value, 'Milan');
                        assert.equal(nodes[2].dimension, 'Budget');
                        assert.equal(nodes[2].value, 'Low');
                        assert.equal(nodes[3].dimension, 'Tipology');
                        assert.equal(nodes[3].value, 'DinnerWithFriends');
                    } else {
                        assert.fail(nodes.length, 4, 'Wrong nodes count');
                    }
                }).catch(function (e) {
                    assert.equal(e, null);
                });

        });
        it('check error when no context specified', function () {
            return contextManager
                .getFilterNodes(null)
                .catch(function (e) {
                   assert.equal(e, 'No context selected');
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
                .getFilterNodes(mockData.wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getSpecificNodes()', function () {
        it('check if correct specific nodes are returned', function () {
            return contextManager
                .getSpecificNodes(mockData.context(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 1) {
                        assert.equal(nodes[0].dimension, 'Location');
                        assert.equal(nodes[0].value, 'newyork');
                        assert.equal(nodes[0].search, 'testCustomSearch');
                    } else {
                        assert.fail(nodes.length, 1, 'Wrong nodes count');
                    }
                });

        });
        it('check error when no context specified', function () {
            return contextManager
                .getSpecificNodes(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
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
                .getSpecificNodes(mockData.wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            return contextManager
                .getParameterNodes(mockData.context(_idCDT))
                .then(function (nodes) {
                    if (nodes.length === 4) {
                        assert.equal(nodes[0].dimension, 'Location');
                        assert.equal(nodes[0].value, 'newyork');
                        assert.equal(nodes[1].dimension, 'Guests');
                        assert.equal(nodes[1].value, 4);
                        assert.equal(nodes[2].dimension, 'Budget');
                        assert.equal(nodes[2].value, 'Low');
                        assert.equal(nodes[3].dimension, 'search_key');
                        assert.equal(nodes[3].value, 'restaurantinnewyork');
                    } else {
                        assert.fail(nodes.length, 4, 'Wrong nodes count');
                    }
                });
        });
        it('check error when no context specified', function () {
            return contextManager
                .getParameterNodes(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
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
                .getParameterNodes(mockData.wrongContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getInterestTopic()', function () {
        it('check if correct interest topic are returned', function () {
            var interestTopic = contextManager.getInterestTopic(mockData.context(_idCDT));
            assert.equal(interestTopic, 'Restaurant');
        });
        it('check error when sending empty context', function () {
            try {
                contextManager.getInterestTopic(emptyContext(_idCDT));
            } catch (e) {
                assert.equal(e.message, 'No context selected');
            }
        });
        it('check error when sending null context', function () {
            try {
                contextManager.getInterestTopic(null);
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
                .getSupportServiceCategories(mockData.context(_idCDT))
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
        it('check error when sending null context', function () {
            return contextManager
                .getSupportServiceCategories(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServiceCategories({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
    });

    describe('#getSupportServicePrimaryDimension()', function () {
        it('check if correct node is returned', function () {
           return contextManager
               .getSupportServicePrimaryDimension('Transport', mockData.context(_idCDT))
               .then(function (node) {
                   assert.notEqual(node, null);
                   assert.equal(node.dimension, 'Transport');
                   assert.equal(node.value, 'PublicTransport');
               });
        });
        it('check error when sending empty context', function () {
            return contextManager
                .getSupportServicePrimaryDimension('Transport', emptySupport(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending null context', function () {
            return contextManager
                .getSupportServicePrimaryDimension('Transport', null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServicePrimaryDimension('Transport', { })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending context without primary dimension specified', function () {
            return contextManager
                .getSupportServicePrimaryDimension('Transport', noInterestTopicContext(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Primary dimension for category \'Transport\' not found');
                });
        });
        it('check error when sending null category name', function () {
            return contextManager
                .getSupportServicePrimaryDimension('', mockData.context(_idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No category selected');
                });
        });
    });

    describe('#getSupportServiceNames()', function () {
        it('check if correct names are returned', function () {
            return contextManager
                .getSupportServiceNames(mockData.context(_idCDT))
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
        it('check error when sending null context', function () {
            return contextManager
                .getSupportServiceNames(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServiceNames({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
    });

    describe('#getDescendants()', function () {
        it('check if correct descendats are returned', function () {
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

    describe('#isDefined()', function () {
        it('check if return true when dimension exists', function () {
            assert.equal(contextManager.isDefined('Location', mockData.context(_idCDT)), true);
        });
        it('check if return false when dimension not exists', function () {
            assert.equal(contextManager.isDefined('Age', mockData.context(_idCDT)), false);
        });
        it('check error when no context is provided', function () {
            try {
                contextManager.isDefined('Test');
            } catch (e) {
                assert.equal(e, 'Error: No context selected');
            }
        });
        it('check error when no dimension name is provided', function () {
            try {
                contextManager.isDefined();
            } catch (e) {
                assert.equal(e, 'Error: Empty or wrong dimension name');
            }
        });
    });

    after(function (done) {
        MockDatabase.deleteDatabase(function (err) {
            assert.equal(err, null);
            done();
        });
    });
});

//context with no dimensions selected
var emptyContext = function (idCDT) {
    return {
        _id: _idCDT,
        context: []
    }
};

//context with no support services selected
var emptySupport = function (idCDT) {
    return {
        _id: _idCDT,
        support: []
    }
};

//context without interest topic
var noInterestTopicContext = function (idCDT) {
    return {
        _id: _idCDT,
        context: [
            {
                dimension: 'Location',
                value: 'newyork',
                for: 'filter|parameter',
                search: 'testCustomSearch'
            }
        ]
    }
};