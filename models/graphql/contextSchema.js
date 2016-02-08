'use strict'

import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql'

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
export const contextItemType = new GraphQLInputObjectType({
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