'use strict'

import {
    GraphQLString,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLList
} from 'graphql'

/**
 * Meta schema
 */
const metaObject = new GraphQLObjectType({
    name: 'MetaItem',
    description: 'Provides additional information about the service that the data come from',
    fields: () => ({
        name: {
            description: 'The services names',
            type: new GraphQLList(GraphQLString)
        },
        rank: {
            description: 'The service\'s rank. If multiple services are specified, it returns the max rank for the current set of services',
            type: GraphQLInt
        }
    })
})

/**
 * Data schema
 */
export default new GraphQLObjectType({
    name: 'DataItem',
    description: 'A single result item',
    fields: () => ({
        title: {
            description: 'The title of the item',
            type: GraphQLString
        },
        address: {
            description: 'The address of the item',
            type: GraphQLString
        },
        telephone: {
            description: 'The telephone number',
            type: GraphQLString
        },
        website: {
            description: 'The website url',
            type: GraphQLString
        },
        city: {
            description: 'The city where the item is',
            type: GraphQLString
        },
        email: {
            description: 'The email address',
            type: GraphQLString
        },
        latitude: {
            description: 'The latitude of the item',
            type: GraphQLString
        },
        longitude: {
            description: 'The longitude of the item',
            type: GraphQLString
        },
        meta: {
            description: 'Additional information about the service that provides the data',
            type: metaObject
        }
    })
})