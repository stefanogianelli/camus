'use strict';

import {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql';

import {
    prepareResponse
} from './../../components/executionHelper';

import {
    contextItemType,
    supportItemType
} from './contextSchema';

import dataType from './primaryDataSchema';

import supportResponseType from './supportDataSchema';

/**
 * Response schema
 */
const responseType = new GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: () => ({
        data: {
            description: 'Provide the list of result items',
            type: new GraphQLList(dataType)
        },
        support: {
            description: 'Provide the URL of the requested support services',
            type: new GraphQLList(supportResponseType)
        }
    })
});

/**
 * Schema for GraphQL query
 */
const queryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The main type for each operation',
    fields: () => ({
        executeQuery: {
            type: responseType,
            description: 'The endpoint committed to the query execution',
            args: {
                _id: {
                    description: 'The CDT identifier',
                    type: GraphQLString
                },
                context: {
                    description: 'The list of context preferences',
                    type: new GraphQLList(contextItemType)
                },
                support: {
                    description: 'The list of support services that are requested',
                    type: new GraphQLList(supportItemType)
                }
            },
            resolve: (root, {_id, context, support}) => {
                return prepareResponse({_id, context, support})
                    .catch(e => {
                        throw new Error(e);
                    });
            }
        }
    })
});

/**
 * The main schema
 */
export default new GraphQLSchema({
    query: queryType
});