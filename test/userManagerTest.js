'use strict'

import assert from 'assert'
import Promise from 'bluebird'

import User from '../components/userManager'
import MockDatabase from './mockDatabaseCreator'
import * as mockModel from './mockModel'
import Provider from '../provider/provider'

const user = new User()
const mockDatabase = new MockDatabase()
const provider = new Provider()

describe('Component: UserManager', () => {

    before(done => {
        provider.createConnection('mongodb://localhost/camus_test')
        mockDatabase.createDatabase((err, idCDT, nestedCDT, multipleSonsCDT) => {
            assert.equal(err, null)
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

    after(done => {
        mockDatabase.deleteDatabase(err => {
            assert.equal(err, null)
            provider.closeConnection()
            done()
        })
    })

})