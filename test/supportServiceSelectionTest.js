'use strict'

import assert from 'assert'

import SupportServiceSelection from '../src/components/supportServiceSelection'
import * as mockData from './mockModel'
import MockDatabase from './mockDatabaseCreator'

const supportServiceSelection = new SupportServiceSelection()
const mockDatabase = new MockDatabase()

let _idCDT = null

describe('Component: SupportServiceSelection', () => {

    before(function(done) {
        mockDatabase.createDatabase((err, idCDT) => {
            _idCDT = idCDT
            done(err)
        })
    })

    describe('#selectServices()', () => {
        it('check if correct services are selected', () => {
            return supportServiceSelection
                .selectServices(mockData.decoratedCdt(_idCDT))
                .then(data => {
                    assert.equal(data.length, 2)
                    assert.equal(data[0].category, 'Transport')
                    assert.equal(data[0].service, 'ATM')
                    assert.equal(data[0].url, 'http://api.atm-mi.it/searchAddress?from={latitude|longitude}&to={latitude|longitude}&key=abc123')
                    assert.equal(data[1].category, 'Transport')
                    assert.equal(data[1].service, 'Trenord')
                    assert.equal(data[1].url, 'http://api.trenord.it/searchStation/fromStation/{startStationName}/toStation/{endStationName}')
                })
        })
        it('check response when the support category does not exists', () => {
            return supportServiceSelection
                .selectServices(contextWithInexistentCategory(_idCDT))
                .then(data => {
                    assert.equal(data.length, 0)
                })
        })
        it('check response when multiple service categories are provided', () => {
            return supportServiceSelection
                .selectServices(contextMultipleSupportServiceCategories(_idCDT))
                .then(data => {
                    assert.equal(data.length, 2)
                    assert.equal(data[0].category, 'Transport')
                    assert.equal(data[0].service, 'GoogleMaps')
                    assert.equal(data[0].url, 'https://maps.googleapis.com/maps/api/distancematrix/json?origins={startCity}&destinations={endCity}&mode=bus')
                    assert.equal(data[1].category, 'Photo')
                    assert.equal(data[1].service, 'Flickr')
                    assert.equal(data[1].url, 'http://api.flickr.com/photos/tag/{tag}')
                })
        })
    })

    after(function (done) {
        mockDatabase.deleteDatabase(err => {
            assert.equal(err, null)
            done()
        })
    })
})

//context with inexistent support category
const contextWithInexistentCategory = idCDT => {
    return {
        _id: idCDT,
        supportServiceCategories: [ 'Sport' ]
    }
}

//context with multiple support service categories
const contextMultipleSupportServiceCategories = idCDT => {
    return {
        _id: idCDT,
        interestTopic: 'Restaurant',
        filterNodes: [
            {
                name: 'Transport',
                value: 'WithCar'
            },
            {
                name: 'Tipology',
                value: 'DinnerWithFriends'
            }
        ],
        supportServiceCategories: [ 'Transport', 'Photo' ]
    }
}