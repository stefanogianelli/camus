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
        for: 'parameter'
    }
];

describe('contextManager', function() {
    describe('getFilterNodes', function () {
        it('check if correct filter nodes are returned', function () {
            contextManager
                .getFilterNodes(context)
                .then(function (nodes) {
                    assert.equal(nodes[0].dimension, 'InterestTopic');
                    assert.equal(nodes[0].value, 'Restaurant');
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
    });
    describe('getParameterNodes', function () {
        it('check if correct parameter nodes are returned', function () {
            contextManager
                .getParameterNodes(context)
                .then(function (nodes) {
                    assert.equal(nodes[0].dimension, 'Location');
                    assert.equal(nodes[0].value, 'Milan');
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
    });
});