var assert = require('assert');
var mongoose = require('mongoose');
var contextManager = require('../components/contextManager.js');
var mockData = require('./mockModel.js');

var idCDT = new mongoose.Types.ObjectId();

describe('Component: ContextManager', function() {

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            return contextManager
                .getFilterNodes(mockData.context(idCDT))
                .then(function (nodes) {
                    if (nodes.length === 3) {
                        assert.equal(nodes[0].dimension, 'InterestTopic');
                        assert.equal(nodes[0].value, 'Restaurant');
                        assert.equal(nodes[1].dimension, 'Budget');
                        assert.equal(nodes[1].value, 'Low');
                        assert.equal(nodes[2].dimension, 'Tipology');
                        assert.equal(nodes[2].value, 'DinnerWithFriends');
                    } else {
                        assert.fail(nodes.length, 3, 'Wrong nodes count');
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
                .getFilterNodes(emptyContext)
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
                .getFilterNodes(mockData.wrongContext(idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getSpecificNodes()', function () {
        it('check if correct specific nodes are returned', function () {
            return contextManager
                .getSpecificNodes(mockData.context(idCDT))
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
                .getSpecificNodes(emptyContext)
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
                .getSpecificNodes(mockData.wrongContext(idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            return contextManager
                .getParameterNodes(mockData.context(idCDT))
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
                .getParameterNodes(emptyContext)
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
                .getParameterNodes(mockData.wrongContext(idCDT))
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getInterestTopic()', function () {
        it('check if correct interest topic are returned', function () {
            var interestTopic = contextManager.getInterestTopic(mockData.context(idCDT));
            assert.equal(interestTopic, 'Restaurant');
        });
        it('check error when sending empty context', function () {
            try {
                contextManager.getInterestTopic(emptyContext);
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
                contextManager.getInterestTopic(noInterestTopicContext);
            } catch (e) {
                assert.equal(e.message, 'No interest topic selected');
            }
        });
    });

    describe('#getSupportServiceCategories()', function () {
        it('check if correct categories are returned', function () {
            return contextManager
                .getSupportServiceCategories(mockData.context(idCDT))
                .then(function (categories) {
                    assert.equal(categories.length, 2);
                    assert.equal(categories[0], 'transport');
                    assert.equal(categories[1], 'sport');
                });
        });
        it('check error when sending empty context', function () {
            return contextManager
                .getSupportServiceCategories(emptySupport)
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
               .getSupportServicePrimaryDimension('transport', mockData.context(idCDT))
               .then(function (node) {
                   assert.notEqual(node, null);
                   assert.equal(node.dimension, 'Transport');
                   assert.equal(node.value, 'PublicTransport');
               });
        });
        it('check error when sending empty context', function () {
            return contextManager
                .getSupportServicePrimaryDimension('transport', emptyContext)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending null context', function () {
            return contextManager
                .getSupportServicePrimaryDimension('transport', null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending empty object', function () {
            return contextManager
                .getSupportServicePrimaryDimension('transport', { })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when sending context without primary dimension specified', function () {
            return contextManager
                .getSupportServicePrimaryDimension('transport', noInterestTopicContext)
                .catch(function (e) {
                    assert.equal(e, 'Primary dimension for category \'transport\' not found');
                });
        });
        it('check error when sending null category name', function () {
            return contextManager
                .getSupportServicePrimaryDimension('', mockData.context(idCDT))
                .catch(function (e) {
                    assert.equal(e, 'No category selected');
                });
        });
    });
});

//context with no dimensions selected
var emptyContext = {
    _id: idCDT,
    context: []
};

//context with no support services selected
var emptySupport = {
    _id: idCDT,
    support: []
};

//context without interest topic
var noInterestTopicContext = {
    _id: idCDT,
    context: [
        {
            dimension: 'Location',
            value: 'newyork',
            for: 'filter|parameter',
            search: 'testCustomSearch'
        }
    ]
};