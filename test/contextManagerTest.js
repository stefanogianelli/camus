var assert = require('assert');
var contextManager = require('../components/contextManager.js');

var context = [
    {
        dimension: 'InterestTopic',
        value: 'Restaurant',
        for: 'filter'
    },
    {
        dimension: 'Location',
        value: 'Milan',
        for: 'filter|parameter',
        search: 'citySearch'
    },
    {
        dimension: 'Guests',
        value: '4',
        for: 'parameter'
    },
    {
        dimension: 'Budget',
        value: 'Low',
        for: 'filter|parameter'
    }
];

var wrongContext = [
    {
        dimension: 'Test',
        value: 'Test'
    }
];

describe('Component: ContextManager', function() {

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            contextManager
                .getFilterNodes(context)
                .then(function (nodes) {
                    if (nodes.length === 2) {
                        assert.equal(nodes[0].dimension, 'InterestTopic');
                        assert.equal(nodes[0].value, 'Restaurant');
                        assert.equal(nodes[1].dimension, 'Budget');
                        assert.equal(nodes[1].value, 'Low');
                    } else {
                        assert.fail(nodes.length, 2, 'Wrong nodes count');
                    }
                });

        });
        it('check error when no context specified', function () {
            contextManager
                .getFilterNodes(null)
                .catch(function (e) {
                   assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty context specified', function () {
            contextManager
                .getFilterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            contextManager
                .getFilterNodes(wrongContext)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'Test\', value: \'Test\' }');
                });
        });
    });

    describe('#getSpecificNodes()', function () {
        it('check if correct specific nodes are returned', function () {
            contextManager
                .getSpecificNodes(context)
                .then(function (nodes) {
                    if (nodes.length === 1) {
                        assert.equal(nodes[0].dimension, 'Location');
                        assert.equal(nodes[0].value, 'Milan');
                    } else {
                        assert.fail(nodes.length, 1, 'Wrong nodes count');
                    }
                });

        });
        it('check error when no context specified', function () {
            contextManager
                .getSpecificNodes(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty context specified', function () {
            contextManager
                .getSpecificNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            contextManager
                .getSpecificNodes(wrongContext)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'Test\', value: \'Test\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            contextManager
                .getParameterNodes(context)
                .then(function (nodes) {
                    if (nodes.length === 2) {
                        assert.equal(nodes[0].dimension, 'Guests');
                        assert.equal(nodes[0].value, 4);
                        assert.equal(nodes[1].dimension, 'Budget');
                        assert.equal(nodes[1].value, 'Low');
                    } else {
                        assert.fail(nodes.length, 2, 'Wrong nodes count');
                    }
                });
        });
        it('check error when no context specified', function () {
            contextManager
                .getParameterNodes(null)
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when empty context specified', function () {
            contextManager
                .getParameterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            contextManager
                .getParameterNodes(wrongContext)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'Test\', value: \'Test\' }');
                });
        });
    });
});