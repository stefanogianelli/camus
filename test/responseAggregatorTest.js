var assert = require('assert');
var responseAggregator = require('../components/responseAggregator.js');

describe('Component: ResponseAggregator', function () {

    describe('#prepareResponse()', function () {
        it('check correct response aggregation', function () {
            return responseAggregator
                .prepareResponse(testResponses, null)
                .then(function (response) {
                    assert.notEqual(response, null);
                    console.log(response);
                })
        });
    });

});

var testResponses = [
    [
        {
            title: 'Bouley',
            address: '163 Duane St, New York, NY 10013, Stati Uniti',
            latitude: 40.7169501,
            longitude: -74.0089346
        },
        {
            title: 'Eleven Madison Park',
            address: '11 Madison Ave, New York, NY 10010, Stati Uniti',
            latitude: 40.741509,
            longitude: -73.9864808
        },
        {
            title: 'Gramercy Tavern',
            address: '42 E 20th St, New York, NY 10003, Stati Uniti',
            latitude: 40.7384596,
            longitude: -73.9885037
        },
        {
            title: 'Le Bernardin',
            address: '155 W 51st St, New York, NY 10019, Stati Uniti',
            latitude: 40.7616941,
            longitude: -73.98188309999999
        },
        {
            title: 'Daniel',
            address: '60 E 65th St, New York, NY 10065, Stati Uniti',
            latitude: 40.7667384,
            longitude: -73.9676095
        },
        {
            title: 'Jean-Georges',
            address: '1 Central Park West, New York, NY 10023, Stati Uniti',
            latitude: 40.769084,
            longitude: -73.981431
        },
        {
            title: 'Per Se',
            address: '4, 10 Columbus Cir, New York, NY 10019, Stati Uniti',
            latitude: 40.7683519,
            longitude: -73.98319839999999
        },
        {
            title: 'The Modern',
            address: '9 W 53rd St, New York, NY 10019, Stati Uniti',
            latitude: 40.7610805,
            longitude: -73.9767531
        },
        {
            title: 'Marea',
            address: '240 Central Park S, New York, NY 10019, Stati Uniti',
            latitude: 40.7674054,
            longitude: -73.98105679999999
        },
        {
            title: 'Aureole',
            address: '135 W 42nd St, New York, NY 10036, Stati Uniti',
            latitude: 40.7556325,
            longitude: -73.9852575
        },
        {
            title: 'Gotham Bar & Grill',
            address: '12 E 12th St, New York, NY 10003, Stati Uniti',
            latitude: 40.7340835,
            longitude: -73.9938031
        },
        {
            title: 'The Four Seasons',
            address: '99 E 52nd St, New York, NY 10022, Stati Uniti',
            latitude: 40.7584364,
            longitude: -73.9721783
        },
        {
            title: 'Blue Hill',
            address: '75 Washington Pl, New York, NY 10011, Stati Uniti',
            latitude: 40.73202819999999,
            longitude: -73.9996946
        },
        {
            title: 'Annisa',
            address: '13 Barrow St, New York, NY 10014, Stati Uniti',
            latitude: 40.7325755,
            longitude: -74.00244289999999
        },
        {
            title: 'La Grenouille',
            address: '3 E 52nd St, New York, NY 10022, Stati Uniti',
            latitude: 40.75965900000001,
            longitude: -73.975597
        },
        {
            title: 'Scarpetta',
            address: '355 W 14th St, New York, NY 10014, Stati Uniti',
            latitude: 40.74093789999999,
            longitude: -74.00481409999999
        },
        {
            title: 'Maialino',
            address: '2 Lexington Ave, New York, NY 10010, Stati Uniti',
            latitude: 40.7385242,
            longitude: -73.9857366
        },
        {
            title: 'Le Cirque',
            address: '151 E 58th St, New York, NY 10022, Stati Uniti',
            latitude: 40.76131150000001,
            longitude: -73.9675393
        },
        {
            title: 'ABC Kitchen',
            address: '35 E 18th St, New York, NY 10003, Stati Uniti',
            latitude: 40.73775819999999,
            longitude: -73.989625
        },
        {
            title: 'Nobu Fifty Seven',
            address: 'west 10019, 40 W 57th St, New York, NY 10019, Stati Uniti',
            latitude: 40.7635397,
            longitude: -73.9764228
        }
    ],
    [
        {
            title: 'International Restaurant & Foodservice Show-New York',
            address: '655 West 34th Street',
            latitude: '40.757644',
            longitude: '-74.002962'
        },
        {
            title: 'The Evolution of The New York City Restaurant',
            address: '24 Irving Ave',
            latitude: '40.7041',
            longitude: '-73.9181'
        },
        {
            title: 'The View Restaurant 5-Course Wine Dinner',
            address: '1535 Broadway',
            latitude: '40.7583428',
            longitude: '-73.9855814'
        },
        {
            title: 'Business Planning for Restaurants',
            address: '110 William St., 4th Floor',
            latitude: '40.7095',
            longitude: '-74.0012'
        },
        {
            title: 'Restaurant Management Bootcamp 2.0, Lower Manhattan 11/9/15',
            address: '110 William St., 4th Floor',
            latitude: '40.7095',
            longitude: '-74.0012'
        },
        {
            title: 'Restaurant Management Bootcamp 2.0: Legal Considerations When Opening a Bar/Restaurant, (1 Session), Brooklyn 12/2/15',
            address: '9 Bond Street, 5th Floor',
            latitude: '40.6942',
            longitude: '-73.9906'
        },
        {
            title: 'New Year\'s Eve: Dueling Pianos\' "Shake, Rattle & Roll"',
            address: '22 Warren Street',
            latitude: '40.7142589',
            longitude: '-74.0079081'
        },
        {
            title: 'Dinner with Terry & George in New York',
            address: '306 West 51st Street',
            latitude: '40.7142',
            longitude: '-74.0064'
        },
        {
            title: 'New York City Jumpstart Alumni Focus Group',
            address: '505 8th Avenue , Suite 1100',
            latitude: '40.7142',
            longitude: '-74.0064'
        },
        {
            title: 'Third Annual Santa’s Winter Workshop at the Conrad New York',
            address: '102 North End Avenue',
            latitude: '40.7146608',
            longitude: '-74.0151044'
        }
    ]
];