'use strict'

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull
} from 'graphql'

/**
 * Schema for the fields associated to a parameter
 */
const fieldSchema = new GraphQLObjectType ({
    name: 'field',
    description: 'A field associated to a parameter of the CDT',
    fields: () => ({
        name: {
            description: 'The field\'s name',
            type: GraphQLString
        },
        type: {
            description: 'The expected type of the field',
            type: GraphQLString
        }
    })
})

/**
 * Schema for the node's parameters
 */
const parameterSchema = new GraphQLObjectType ({
    name: 'parameter',
    description: 'A parameter associated to a node of the CDT',
    fields: () => ({
        name: {
            description: 'The parameter name',
            type: GraphQLString
        },
        type: {
            description: 'The expected type of the parameter',
            type: GraphQLString
        },
        enum: {
            description: 'The list of possible values that the parameter can assume',
            type: new GraphQLList(GraphQLString)
        },
        fields: {
            description: 'The list of fields that the parameter can be composed',
            type: new GraphQLList(fieldSchema)
        }
    })
})

/**
 * Schema for each object that compose the CDT
 */
const nodeSchema = new GraphQLObjectType({
    name: 'cdtNode',
    description: 'A single node of the CDT',
    fields: () => ({
        name: {
            description: 'The node name',
            type: GraphQLString
        },
        values: {
            description: 'The possible values that the node can assume',
            type: new GraphQLList(GraphQLString)
        },
        parameters: {
            description: 'The list of parameters associated to the node',
            type: new GraphQLList(parameterSchema)
        },
        parents: {
            description: 'The (unordered) list of parents node',
            type: new GraphQLList(GraphQLString)
        }
    })
})

/**
 * Schema for default values in the user's CDTs
 */
const defaultSchema = new GraphQLObjectType({
    name: 'defaultValues',
    description: 'The list of values that are always valid',
    fields: () => ({
        dimension: {
            description: 'The dimension name',
            type: new GraphQLNonNull(GraphQLString)
        },
        value: {
            description: 'The value',
            type: new GraphQLNonNull(GraphQLString)
        }
    })
})

export {
    nodeSchema,
    defaultSchema
}