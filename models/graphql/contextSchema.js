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

/**
 * Support item
 */
export const supportItemType = new GraphQLInputObjectType({
    name: 'SupportItem',
    description: 'Support service item. It allows the definition of the requested support service name or category. If a service is requested by the name the fields name and operation are mandatory. Otherwise it\'s sufficient to specify a category' ,
    fields: () => ({
        name: {
            description: 'The support service name',
            type: GraphQLString
        },
        operation: {
            description: 'The support service operation name',
            type: GraphQLString
        },
        category: {
            description: 'The support service category',
            type: GraphQLString
        }
    })
})