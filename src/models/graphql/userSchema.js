'use strict'

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList
} from 'graphql'

import {
    nodeSchema,
    defaultSchema
} from './cdtSchema'

import {
    mashupType
} from './mashupSchema'

/**
 * LOGIN SCHEMA
 */

export const loginType = new GraphQLObjectType({
    name: 'Login',
    description: 'The login result schema',
    fields: () => ({
        name: {
            description: 'The user\'s name',
            type: GraphQLString
        },
        surname: {
            description: 'The user\'s surname',
            type: GraphQLString
        },
        email: {
            description: 'The user\'s email address',
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

/**
 * PERSONAL DATA SCHEMA
 */

const cdtType = new GraphQLObjectType({
    name: 'CdtDescriptor',
    description: 'The CDT descriptor',
    fields: () => ({
        idCdt: {
            type: GraphQLString,
            description: 'The CDT identifier',
            resolve: (cdt) => cdt._id
        },
        context: {
            type: new GraphQLList(nodeSchema),
            description: 'The context nodes that the CDT is composed'
        },
        defaultValues: {
            type: new GraphQLList(defaultSchema),
            description: 'The list of default values that are always enabled in the context-based search'
        }
    })
})

export const personalDataType = new GraphQLObjectType({
    name: 'PersonalData',
    description: 'The personal data of the user (CDT)',
    fields: () => ({
        cdt: {
            type: cdtType,
            description: 'The CDT descriptor'
        },
        mashup: {
            type: mashupType,
            description: 'The mashup schema'
        }
    })
})

export const personalDataArgs = {
    mail: {
        description: 'The user\'s email address',
        type: new GraphQLNonNull(GraphQLString)
    },
    token: {
        description: 'The session token associated to the user',
        type: new GraphQLNonNull(GraphQLString)
    }
}