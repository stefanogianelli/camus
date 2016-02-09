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

    /**
     * Retrieve the user's personal data. First it checks that the user is correctly logged in
     * @param {String} id - The user's identifier
     * @param {String} token - The session token associated to the user
     * @returns {Object} The CDT associated to the user
     */
    getPersonalData (id, token) {
        //check if the user is correctly logged in
        return provider
            .checkUserLogin(id, token)
            .then(() => {
                //retrieve the user CDT
                return provider.getCdtByUser(id)
            })
    }

}