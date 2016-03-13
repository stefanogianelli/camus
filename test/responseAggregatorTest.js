'use strict'

import assert from 'assert'
import _ from 'lodash'

import ResponseAggregator from '../src/components/responseAggregator'

const responseAggregator = new ResponseAggregator()

describe('Component: ResponseAggregator', () => {

    describe('#prepareResponse()', () => {
        it('check correct response aggregation', () => {
            return responseAggregator
                .prepareResponse(_.cloneDeep(testSuccessfulMerging))
                .then(response => {
                    assert.equal(response.results.length, 3)
                })
        })
        it('check error message when empty response list is sent', () => {
           return responseAggregator
               .prepareResponse([])
               .catch(e => {
                   assert.equal(e, 'No results')
               })
        })
    })

    describe('#findSimilarities()', () => {
        it('check if similar items are correctly merged', () => {
            const response = responseAggregator._findSimilarities(_.cloneDeep(testSuccessfulMerging).results)
            assert.equal(response.length, 3)
            assert.equal(response[0].title, 'Bottega Ghiotta Gourmet')
            assert.equal(response[0].tipologia, 'Ristorante Italiano, Pizzeria')
            assert.equal(response[0].rating, '5/5')
            assert.equal(response[0].recensioni, 24)
            assert.equal(response[0].indirizzo, 'Corso Sempione, 5, 20154 Milano, Italia')
            assert.equal(response[0].telefono, '+39 02 3956 6018')
            assert.equal(response[0].website, 'http://www.bottegaghiotta.it/')
            assert.equal(response[0].meta.name[0], 'Service1')
            assert.equal(response[0].meta.name[1], 'Service2')
            assert.equal(response[0].meta.rank, 3)
            assert.equal(response[1].title, 'Savana Ristorante Eritreo')
            assert.equal(response[1].rating, '5/5')
            assert.equal(response[1].recensioni, 61)
            assert.equal(response[1].indirizzo, 'Via Luigi Canonica 45, 20154 Milano, Italia')
            assert.equal(response[1].telefono, '393664073136')
            assert.equal(response[1].website, 'http://www.ristoranteritreosavana.com/')
            assert.equal(response[1].meta.name[0], 'Service1')
            assert.equal(response[1].meta.rank, 3)
            assert.equal(response[2].title, 'Nerino Dieci Trattoria')
            assert.equal(response[2].rating, '4.5/5')
            assert.equal(response[2].recensioni, 2502)
            assert.equal(response[2].indirizzo, 'Via Nerino 10, 20123 Milano, Italia')
            assert.equal(response[2].telefono, '+39 02 3983 1019')
            assert.equal(response[2].website, 'http://www.nerinodieci.it/')
            assert.equal(response[2].tipologia, 'Ristorante Italiano')
            assert.equal(response[2].meta.name[0], 'Service2')
            assert.equal(response[2].meta.name[1], 'Service3')
            assert.equal(response[2].meta.rank, 2)
        })
    })

    describe('#calculateObjectSimilarity()', () => {
        it('check if similar objects are identified', () => {
            assert.equal(responseAggregator._calculateObjectSimilarity(baseObject, similarObject) >= 0.85, true)
        })
        it('check if different objects are identified', () => {
            assert.equal(responseAggregator._calculateObjectSimilarity(baseObject, differentObject) >= 0.85, false)
        })
    })

})

//Base object for similarity testing
const baseObject = {
    title: 'Spectre',
    director: 'Sam Mendes',
    writtenBy: 'John Logan, Neal Purvis, Robert Wade, Jez Butterworth',
    starring: 'Daniel Craig, Christoph Waltz, Lea Seydoux, Ben Whishaw',
    meta: {
        name: ['Service1'],
        rank: 1
    }
}

//Example of an object similar to the base one
const similarObject = {
    title: 'Spectre',
    director: 'Mendes J. Sam',
    writtenBy: 'John Logan, Robert Wade, Jez Butterworth, Neal Purvis',
    starring: 'Daniel Craig as James Bond, Christoph Waltz as Franz Oberhauser, Lea Seydoux as Dr. Madeleine Swann',
    meta: {
        name: ['Service2'],
        rank: 2
    }
}

//Example of an object different from the base one
const differentObject = {
    title: 'Burnt',
    director: 'John Wells',
    writtenBy: 'Steven Knight',
    starring: 'Bradley Cooper as Adam Jones, Sienna Miller as Helene, Omar Sy as Michel',
    meta: {
        name: ['Service3'],
        rank: 3
    }
}

//response used to test if two similar items are merged correctly
const testSuccessfulMerging = {
    results: [
        {
            title: 'Bottega Ghiotta Gourmet',
            rating: '5/5',
            recensioni: 24,
            indirizzo: 'Corso Sempione, 5, 20154 Milano, Italia',
            telefono: '+39 02 3956 6018',
            website: 'http://www.bottegaghiotta.it/',
            meta: {
                name: ['Service1'],
                rank: 3
            }
        },
        {
            title: 'Savana Ristorante Eritreo',
            rating: '5/5',
            recensioni: 61,
            indirizzo: 'Via Luigi Canonica 45, 20154 Milano, Italia',
            telefono: '393664073136',
            website: 'http://www.ristoranteritreosavana.com/',
            meta: {
                name: ['Service1'],
                rank: 3
            }
        },
        {
            title: 'Bottega Ghiotta Gourmet',
            tipologia: 'Ristorante Italiano, Pizzeria',
            rating: '5/5',
            recensioni: 21,
            indirizzo: 'Corso Sempione 5, Milano',
            telefono: '02 3956 6018',
            website: 'http://www.bottegaghiotta.it/',
            meta: {
                name: ['Service2'],
                rank: 2
            }
        },
        {
            title: 'Nerino Dieci Trattoria',
            rating: '4.5/5',
            recensioni: 502,
            indirizzo: 'Via Nerino 10, 20123 Milano, Italia',
            telefono: '+39 02 3983 1019',
            website: 'http://www.nerinodieci.it/',
            tipologia: 'Ristorante Italiano',
            meta: {
                name: ['Service3'],
                rank: 1
            }
        },
        {
            title: 'Nerino Dieci Trattoria',
            rating: '4.5/5',
            recensioni: 2502,
            indirizzo: 'Via Nerino 10, 20123 Milano, Italia',
            telefono: '+39 02 3983 1019',
            website: 'http://www.nerinodieci.it/',
            meta: {
                name: ['Service2'],
                rank: 2
            }
        }
    ]
}