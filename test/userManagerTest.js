'use strict'

import assert from 'assert'
import Promise from 'bluebird'
import hat from 'hat'
import mongoose from 'mongoose'

import User from '../src/components/userManager'
import MockDatabase from './mockDatabaseCreator'
import * as mockModel from './mockModel'
import Provider from '../src/provider/provider'

const user = new User()
const mockDatabase = new MockDatabase()
const provider = Provider.getInstance()

const ObjectId = mongoose.Types.ObjectId

let _idCdt = null
let _mashupId = null

describe('Component: UserManager', () => {

    before(done => {
        mockDatabase.createDatabase((err, idCDT, x, y, mashupId) => {
            _idCdt = idCDT
            _mashupId = mashupId
            done(err)
        })
    })

    describe('#login()', () => {
        it('check correct login execution', () => {
            return user
                .login(mockModel.user.mail, mockModel.user.password)
                .then(result => {
                    assert.notEqual(result, undefined)
                })
        })
        it('check error message when an invalid email or password is provided', () => {
            return Promise
                .join(
                    user
                        .login('beppe', mockModel.user.password)
                        .catch(err => {
                            assert.equal(err, 'Invalid mail or password')
                        }),
                    user
                        .login(mockModel.user.mail, 'wrong')
                        .catch(err => {
                            assert.equal(err, 'Invalid mail or password')
                        })
                )
        })
    })

    describe('#getPersonalData()', () => {
        it('check if correct cdt is returned', () => {
            return user
                .login(mockModel.user.mail, mockModel.user.password)
                .then(result => {
                    return user.getPersonalData(mockModel.user.mail, result.token)
                })
                .then(data => {
                    assert.equal(data.cdt._id.toString(), _idCdt)
                    assert.equal(data.mashup._userId.length, 1)
                })
        })
        it('check error message when an invalid user id is provided', () => {
            return user
                .getPersonalData(new ObjectId(), hat())
                .catch(err => {
                    assert.equal(err, 'User not logged in')
                })
        })
        it('check error message when an invalid token is provided', () => {
            return user
                .login(mockModel.user.mail, mockModel.user.password)
                .then(result => {
                    return user.getPersonalData(result.id, hat)
                })
                .catch(err => {
                    assert.equal(err, 'User not logged in')
                })
        })
        it('check if global CDT is returned when the user hasn\'t any CDT associated', () => {
            return user
                .login(mockModel.anotherUser.mail, mockModel.anotherUser.password)
                .then(result => {
                    return user.getPersonalData(mockModel.anotherUser.mail, result.token)
                })
                .then(data => {
                    assert.equal(data.cdt._id.toString(), _idCdt)
                    assert.equal(data.mashup._id.toString(), _mashupId)
                })
        })
    })

    after(done => {
        mockDatabase.deleteDatabase(err => {
            done(err)
        })
    })

})