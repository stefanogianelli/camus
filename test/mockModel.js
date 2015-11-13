//contex
var context = {
    context: [
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
    ]
};

module.exports.context = context;

//wrong context
var wrongContext = [
    {
        dimension: 'Test',
        value: 'Test'
    }
];

module.exports.wrongContext = wrongContext;

//service1
var service1 = {
    name: 'GooglePlaces',
    type: 'primary',
    protocol: 'rest',
    operations: [
        {
            name: 'operation1'
        }
    ]
};

module.exports.service1 = service1;

//primary service 1
var primaryService1 = function (idOperation) {
    return {
        _idOperation: idOperation,
        dimension: 'InterestTopic',
        value: 'Restaurant',
        ranking: 1,
        weight: 2
    }
};

module.exports.primaryService1 = primaryService1;