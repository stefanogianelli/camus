'use strict'

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} from 'graphql'

export const loginType = new GraphQLObjectType({
    name: 'Login',
    description: 'The login result schema',
    fields: () => ({
        id: {
            description: 'The user\'s identifier',
            type: GraphQLString
        },
        token: {
            description: 'The session token',
            type: GraphQLString
        }
    })
})

export const loginArgs = {
    mail: {
        description: 'The user\'s email address',
        type: new GraphQLNonNull(GraphQLString)
    },
    password: {
        description: 'The user\'s password',
        type: new GraphQLNonNull(GraphQLString)
    }
}