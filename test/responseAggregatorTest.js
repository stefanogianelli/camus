var assert = require('assert');
var responseAggregator = require('../components/responseAggregator.js');

describe('Component: ResponseAggregator', function () {

    describe('#prepareResponse()', function () {
        it('check correct response aggregation', function () {
            return responseAggregator
                .prepareResponse(testSuccessfulMerging, supportResponse)
                .then(function (response) {
                    assert.equal(response.data.length, 3);
                    assert.equal(response.support.length, 3);
                });
        });
        it('check correct response when no support services are found', function () {
            return responseAggregator
                .prepareResponse(testSuccessfulMerging, [])
                .then(function (response) {
                    assert.equal(response.data.length, 3);
                    assert.equal(response.support.length, 0);
                });
        });
        it('check error message when empty response list is sent', function () {
           return responseAggregator
               .prepareResponse([], [])
               .catch(function (e) {
                   assert.equal(e, 'No results');
               })
        });
    });

    describe('#findSimilarities()', function () {
        it('check if similar items are correctly merged', function () {
            var response = responseAggregator.findSimilarities(testSuccessfulMerging);
            assert.equal(response[0][0].nome, 'Bottega Ghiotta Gourmet');
            assert.equal(response[0][0].tipologia, 'Ristorante Italiano, Pizzeria');
            assert.equal(response[0][0].rating, '5/5');
            assert.equal(response[0][0].recensioni, 24);
            assert.equal(response[0][0].indirizzo, 'Corso Sempione, 5, 20154 Milano, Italia');
            assert.equal(response[0][0].telefono, '+39 02 3956 6018');
            assert.equal(response[0][0].website, 'http://www.bottegaghiotta.it/');
            assert.equal(response[0][1].nome, 'Savana Ristorante Eritreo');
            assert.equal(response[0][1].rating, '5/5');
            assert.equal(response[0][1].recensioni, 61);
            assert.equal(response[0][1].indirizzo, 'Via Luigi Canonica 45, 20154 Milano, Italia');
            assert.equal(response[0][1].telefono, '393664073136');
            assert.equal(response[0][1].website, 'http://www.ristoranteritreosavana.com/');
            assert.equal(response[1][0].nome, 'Nerino Dieci Trattoria');
            assert.equal(response[1][0].rating, '4.5/5');
            assert.equal(response[1][0].recensioni, 2502);
            assert.equal(response[1][0].indirizzo, 'Via Nerino 10, 20123 Milano, Italia');
            assert.equal(response[1][0].telefono, '+39 02 3983 1019');
            assert.equal(response[1][0].website, 'http://www.nerinodieci.it/');
            assert.equal(response[1][0].tipologia, 'Ristorante Italiano');
        });
    });

    describe('#calculateObjectSimilarity()', function () {
        it('check if similar objects are identified', function () {
            assert.equal(responseAggregator.calculateObjectSimilarity(baseObject, similarObject), true);
        });
        it('check if different objects are identified', function () {
            assert.equal(responseAggregator.calculateObjectSimilarity(baseObject, differentObject), false);
        });
    });

});

//Base object for similarity testing
var baseObject = {
    title: 'Spectre',
    director: 'Sam Mendes',
    writtenBy: 'John Logan, Neal Purvis, Robert Wade, Jez Butterworth',
    starring: 'Daniel Craig, Christoph Waltz, Lea Seydoux, Ben Whishaw'
};

//Example of an object similar to the base one
var similarObject = {
    title: 'Spectre',
    director: 'Mendes J. Sam',
    writtenBy: 'John Logan, Robert Wade, Jez Butterworth, Neal Purvis',
    starring: 'Daniel Craig as James Bond, Christoph Waltz as Franz Oberhauser, Lea Seydoux as Dr. Madeleine Swann'
};

//Example of an object different from the base one
var differentObject = {
    title: 'Burnt',
    director: 'John Wells',
    writtenBy: 'Steven Knight',
    starring: 'Bradley Cooper as Adam Jones, Sienna Miller as Helene, Omar Sy as Michel'
};

//response used to test if two similar items are merged correctly
var testSuccessfulMerging = [
    [
        {
            nome: 'Bottega Ghiotta Gourmet',
            rating: '5/5',
            recensioni: 24,
            indirizzo: 'Corso Sempione, 5, 20154 Milano, Italia',
            telefono: '+39 02 3956 6018',
            website: 'http://www.bottegaghiotta.it/'
        },
        {
            nome: 'Savana Ristorante Eritreo',
            rating: '5/5',
            recensioni: 61,
            indirizzo: 'Via Luigi Canonica 45, 20154 Milano, Italia',
            telefono: '393664073136',
            website: 'http://www.ristoranteritreosavana.com/'
        }
    ],
    [
        {
            nome: 'Bottega Ghiotta Gourmet',
            tipologia: 'Ristorante Italiano, Pizzeria',
            rating: '5/5',
            recensioni: 21,
            indirizzo: 'Corso Sempione 5, Milano',
            telefono: '02 3956 6018',
            website: 'http://www.bottegaghiotta.it/'
        },
        {
            nome: 'Nerino Dieci Trattoria',
            rating: '4.5/5',
            recensioni: 2502,
            indirizzo: 'Via Nerino 10, 20123 Milano, Italia',
            telefono: '+39 02 3983 1019',
            website: 'http://www.nerinodieci.it/'
        }
    ],
    [
        {
            nome: 'Nerino Dieci Trattoria',
            rating: '4.5/5',
            recensioni: 502,
            indirizzo: 'Via Nerino 10, 20123 Milano, Italia',
            telefono: '+39 02 3983 1019',
            website: 'http://www.nerinodieci.it/',
            tipologia: 'Ristorante Italiano'
        }
    ]
];

//test response that came from SupportServiceSelection component
var supportResponse = [
    {
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/w/api.php?action=query&titles={search_key}&prop=revisions&rvprop=content&format=json'
    },
    {
        category: 'Transport',
        service: 'ATM',
        url: 'http://api.atm-mi.it/searchAddress'
    },
    {
        category: 'Transport',
        service: 'Trenord',
        url: NaN
    }
];