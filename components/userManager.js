'use strict'

import hat from 'hat'
import Promise from 'bluebird'

import Provider from '../provider/provider'

const provider = new Provider()

export default class {

    /**
     * Check if the specified mail and password correspond to a valid user.
     * It also creates and update the sessione token associated to the user
     * @param {String} mail - The user's email address
     * @param {String} password - The user's password
     * @returns {Promise<{id: String, token: String}>} Return the user's identifier and token
     */
    login (mail, password) {
        return new Promise ((resolve, reject) => {
            //check the correctness of the input data
            provider
                .getUser(mail, password)
                .then(user => {
                    //create and update the session token
                    const token = hat()
                    user.update({token: token}, err => {
                        if (err) {
                            reject(err)
                        }
                        resolve({
                            id: user.id,
                            token: token
                        })
                    })
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

}