'use strict'

import {
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql'

import {
    getDecoratedCdt,
    login
} from './../../components/executionHelper'

import {
    contextArgs,
    responseType
} from './contextSchema'

import {
    loginType,
    loginArgs
} from './loginSchema'

/**
 * Schema for GraphQL query
 */
const queryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The main type for each operation',
    fields: () => ({
        executeQuery: {
            type: responseType,
            description: 'The endpoint committed to the query execution',
            args: contextArgs,
            resolve: (root, {_id, context, support}) => {
                return getDecoratedCdt({_id, context, support})
            }
        },
        login: {
            type: loginType,
            description: 'The endpoint committed to the user login',
            args: loginArgs,
            resolve: (root, {mail, password}) => {
                return login(mail, password)
            }
        }
    })
})

/**
 * The main schema
 */
export const camusSchema = new GraphQLSchema({
    query: queryType
})