//contex
var context = function(idCDT) {
    return {
        _id: idCDT,
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
    }
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

//googlePlaces
var googlePlaces = {
    name: 'GooglePlaces',
    type: 'primary',
    protocol: 'rest',
    basePath: 'http://localhost:3000/maps/api/place',
    operations: [
        {
            name: 'placeTextSearch',
            path: '/textsearch/json',
            parameters: [
                {
                    name: 'query',
                    required: '1',
                    default: 'restaurant+in+milan',
                    mappingCDT: 'search_key'
                },
                {
                    name: 'key',
                    required: '1',
                    default: 'AIzaSyDyueyso-B0Vx4rO0F6SuOgv-PaWI12Mio'
                }
            ],
            responseMapping: {
                list: 'results',
                items: [
                    {
                        termName: 'title',
                        path: 'name'
                    },
                    {
                        termName: 'address',
                        path: 'formatted_address'
                    },
                    {
                        termName: 'latitude',
                        path: 'geometry.location.lat'
                    },
                    {
                        termName: 'longitude',
                        path: 'geometry.location.lng'
                    }
                ]
            }
        }
    ]
};

module.exports.googlePlaces = googlePlaces;

//googlePlaces associations
var googlePlacesAssociations = function (idOperation, idCDT) {
    return [
        {
            _idOperation: idOperation,
            dimension: 'InterestTopic',
            value: 'Restaurant',
            ranking: 1,
            weight: 2,
            _idCDT: idCDT
        },
        {
            _idOperation: idOperation,
            dimension: 'Tipologia',
            value: 'CenaConAmici',
            ranking: 2,
            weight: 2,
            _idCDT: idCDT
        }
    ]
};

module.exports.googlePlacesAssociations = googlePlacesAssociations;