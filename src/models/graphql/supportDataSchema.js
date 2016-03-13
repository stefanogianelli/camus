'use strict'

import {
    GraphQLString,
    GraphQLObjectType
} from 'graphql'

/**
 * Support response schema
 */
export default new GraphQLObjectType ({
    name: 'SupportResponse',
    description: 'It contains list of support service descriptions',
    fields: () => ({
        category: {
            description: 'The category that the service belongs to',
            type: GraphQLString
        },
        service: {
            description: 'The service provider',
            type: GraphQLString
        },
        url: {
            description: 'The service URL',
            type: GraphQLString
        }
    })
})