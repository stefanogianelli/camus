'use strict'

import assert from 'assert'
import Promise from 'bluebird'
import hat from 'hat'
import mongoose from 'mongoose'

import User from '../components/userManager'
import MockDatabase from './mockDatabaseCreator'
import * as mockModel from './mockModel'
import Provider from '../provider/provider'

const user = new User()
const mockDatabase = new MockDatabase()
const provider = new Provider()

let _idCdt = ''
const ObjectId = mongoose.Types.ObjectId

describe('Component: UserManager', () => {

    before(done => {
        provider.createConnection('mongodb://localhost/camus_test')
        mockDatabase.createDatabase((err, idCDT, nestedCDT, multipleSonsCDT) => {
            assert.equal(err, null)
            _idCdt = idCDT
            done()
        })
    })

    describe('#login()', () => {
        it('check correct login execution', () => {
            return user
                .login(mockModel.user.mail, mockModel.user.password)
                .then(result => {
                    assert.notEqual(result, undefined)
                    return [result.token, provider.getUser(mockModel.user.mail, mockModel.user.password)]
                })
                .spread((token, user) => {
                    assert.equal(user.token, token)
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
                    return user.getPersonalData(result.id, result.token)
                })
                .then(cdt => {
                    assert.equal(cdt._id.toString(), _idCdt)
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
    })

    after(done => {
        mockDatabase.deleteDatabase(err => {
            assert.equal(err, null)
            provider.closeConnection()
            done()
        })
    })

})