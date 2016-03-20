'use strict'

import {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType
} from 'graphql'

const contentType = new GraphQLObjectType({
    name: 'contentType',
    description: 'The content of an item',
    fields: () => ({
        type: {
            type: GraphQLString,
            description: 'The component\'s typology'
        },
        style: {
            type: GraphQLString,
            description: 'Define the style of the component'
        },
        contents: {
            type: new GraphQLList(GraphQLString),
            description: 'Define the terms or sub-components to be shown'
        }
    })
})

const itemType = new GraphQLObjectType({
    name: 'itemType',
    description: 'Define rules for items to be shown',
    fields: () => ({
        topics: {
            type: new GraphQLList(GraphQLString),
            description: 'The topics targeted by the current schema'
        },
        contents: {
            type: new GraphQLList(contentType),
            description: 'The rules to compose the view'
        }
    })
})

const mashupType = new GraphQLObjectType({
    name: 'mashupSchema',
    description: 'The mashup schema',
    fields: () => ({
        list: {
            type: new GraphQLList(itemType),
            description: 'The items for the list view'
        },
        details: {
            type: new GraphQLList(itemType),
            description: 'The items for the details pages'
        }
    })
})

export {
    mashupType
}