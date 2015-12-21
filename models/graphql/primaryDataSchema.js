import {
    GraphQLString,
    GraphQLObjectType
} from 'graphql';

/**
 * Data schema
 */
export default new GraphQLObjectType({
    name: 'DataItem',
    description: 'A single result item',
    fields: {
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
        }
    }
});