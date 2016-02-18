'use strict'

import mongoose from 'mongoose'
const Schema = mongoose.Schema

/**
 * The user schema
 */
const userSchema = new Schema({
    name: String,
    surname: String,
    mail: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: String
})

const userModel = mongoose.model('user', userSchema)

export default userModel