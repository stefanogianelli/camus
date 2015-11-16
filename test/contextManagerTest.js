var assert = require('assert');
var mongoose = require('mongoose');
var contextManager = require('../components/contextManager.js');
var mockData = require('./mockModel.js');

var idCDT = new mongoose.Types.ObjectId();

describe('Component: ContextManager', function() {

    describe('#getFilterNodes()', function () {
        it('check if correct filter nodes are returned', function () {
            return contextManager
                .getFilterNodes(mockData.context(idCDT).context)
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
                .getFilterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getFilterNodes(mockData.wrongContext(idCDT).context)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getSpecificNodes()', function () {
        it('check if correct specific nodes are returned', function () {
            return contextManager
                .getSpecificNodes(mockData.context(idCDT).context)
                .then(function (nodes) {
                    if (nodes.length === 1) {
                        assert.equal(nodes[0].dimension, 'Location');
                        assert.equal(nodes[0].value, 'Milan');
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
                .getSpecificNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getSpecificNodes(mockData.wrongContext(idCDT).context)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });

    describe('#getParameterNodes()', function () {
        it('check if correct parameter nodes are returned', function () {
            return contextManager
                .getParameterNodes(mockData.context(idCDT).context)
                .then(function (nodes) {
                    if (nodes.length === 4) {
                        assert.equal(nodes[0].dimension, 'Location');
                        assert.equal(nodes[0].value, 'Milan');
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
                .getParameterNodes({ })
                .catch(function (e) {
                    assert.equal(e, 'No context selected');
                });
        });
        it('check error when context have a wrong format', function () {
            return contextManager
                .getParameterNodes(mockData.wrongContext(idCDT).context)
                .catch(function (e) {
                    assert.equal(e, 'Lack of attribute \'for\' in item { dimension: \'InterestTopic\', value: \'Restaurant\' }');
                });
        });
    });
});