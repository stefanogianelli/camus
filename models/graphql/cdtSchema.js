'use strict'

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList
} from 'graphql'

const fieldSchema = new GraphQLObjectType ({
    name: 'field',
    description: 'A field of the CDT',
    fields: () => ({
        name: {
            type: GraphQLString
        }
    })
})

const parameterSchema = new GraphQLObjectType ({
    name: 'parameter',
    description: 'A parameter of the CDT',
    fields: () => ({
        name: {
            type: GraphQLString
        },
        type: {
            type: GraphQLString
        },
        enum: {
            type: new GraphQLList(GraphQLString)
        },
        fields: {
            type: new GraphQLList(fieldSchema)
        }
    })
})

const nodeSchema = new GraphQLObjectType({
    name: 'cdtNode',
    description: 'A single node of the CDT',
    fields: () => ({
        name: {
            type: GraphQLString
        },
        for: {
            type: GraphQLString
        },
        values: {
            type: new GraphQLList(GraphQLString)
        },
        parameters: {
            type: new GraphQLList(parameterSchema)
        },
        parents: {
            type: new GraphQLList(GraphQLString)
        }
    })
})

export default nodeSchema