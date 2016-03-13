'use strict'

import {
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql'

import {
    getDecoratedCdt,
    login,
    getPersonalData
} from './../../components/executionHelper'

import {
    contextArgs,
    responseType
} from './contextSchema'

import {
    loginType,
    loginArgs,
    personalDataType,
    personalDataArgs
} from './userSchema'

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
            resolve: (root, {userId, idCdt, context, support}) => {
                return getDecoratedCdt(userId, {idCdt, context, support})
            }
        },
        login: {
            type: loginType,
            description: 'The endpoint committed to the user login',
            args: loginArgs,
            resolve: (root, {mail, password}) => {
                return login(mail, password)
            }
        },
        getPersonalData: {
            type: personalDataType,
            description: 'The endpoint committed to provide personal data about the logged user',
            args: personalDataArgs,
            resolve: (root, {id, token}) => {
                return getPersonalData(id, token)
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