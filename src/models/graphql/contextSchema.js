'use strict'

import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull
} from 'graphql'

import {
    primaryConnection,
    supportConnection
} from './connections'

/**
 * Field schema
 */
const fieldItemType = new GraphQLInputObjectType({
    name: 'FieldItem',
    description: 'A sub-parameter item',
    fields: () => ({
        name: {
            description: 'The parameter name',
            type: GraphQLString
        },
        value: {
            description: 'The parameter value',
            type: GraphQLString
        }
    })
})

/**
 * Parameter schema
 */
const parameterItemType = new GraphQLInputObjectType({
    name: 'ParameterItem',
    description: 'It define a single parameter associated to the node. It\'s possible to define nested sub-parameters',
    fields: () => ({
        name: {
            description: 'The parameter name',
            type: GraphQLString
        },
        value: {
            description: 'The parameter value',
            type: GraphQLString
        },
        fields: {
            description: 'The list of sub-parameters',
            type: new GraphQLList(fieldItemType)
        }
    })
})

/**
 * Context item
 */
const contextItemType = new GraphQLInputObjectType({
    name: 'ContextItem',
    description: 'A context item is a single selection made by the user',
    fields: () => ({
        dimension: {
            description: 'The selected dimension. It can be also a parameter name',
            type: GraphQLString
        },
        value: {
            description: 'The value selected',
            type: GraphQLString
        },
        parameters: {
            description: 'The list of parameters associated to the node',
            type: new GraphQLList(parameterItemType)
        }
    })
})

/**
 * Response schema
 */
export const responseType = new GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: () => ({
        connectionId: {
            type: GraphQLString,
            description: 'The connection\'s identifier'
        },
        primaryResults: primaryConnection(),
        supportResults: supportConnection()
    })
})

/**
 * Context arguments
 */
export const contextArgs = {
    userMail: {
        description: 'The user\'s email address',
        type: new GraphQLNonNull(GraphQLString)
    },
    idCdt: {
        description: 'The CDT\'s identifier',
        type: new GraphQLNonNull(GraphQLString)
    },
    context: {
        description: 'The list of context preferences',
        type: new GraphQLNonNull(new GraphQLList(contextItemType))
    },
    support: {
        description: 'The list of support service categories that will be retrieved in the CDT',
        type: new GraphQLList(GraphQLString)
    }
}