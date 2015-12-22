'use strict';

import {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLID,
    GraphQLNonNull
} from 'graphql';

import {
    getDecoratedCdt
} from './../../components/executionHelper';

import {
    contextItemType,
    supportItemType
} from './contextSchema';

import {
    nodeField,
    nodeInterface
} from './relayNode';

import {
    primaryConnection,
    supportConnection
} from './connections';

import {
    base64
} from '../../utils/base64';

import dataType from './primaryDataSchema';

import supportResponseType from './supportDataSchema';

/**
 * Response schema
 */
export const responseType = new GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLID),
            resolve: (decoratedCdt) => {
                return base64(JSON.stringify(decoratedCdt));
            }
        },
        primaryResults: primaryConnection(),
        supportResults: supportConnection()
    }),
    interfaces: () => [nodeInterface]
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
                    type: new GraphQLNonNull(GraphQLString)
                },
                context: {
                    description: 'The list of context preferences',
                    type: new GraphQLNonNull(new GraphQLList(contextItemType))
                },
                support: {
                    description: 'The list of support services that are requested',
                    type: new GraphQLList(supportItemType)
                }
            },
            resolve: (root, {_id, context, support}) => {
                return getDecoratedCdt({_id, context, support});
            }
        },
        node: nodeField
    })
});

/**
 * The main schema
 */
export default new GraphQLSchema({
    query: queryType
});