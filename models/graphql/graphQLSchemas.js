'use strict';

import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql';

import ExecutionHelper from './../../components/executionHelper';

const executionHelper = new ExecutionHelper();

/**
 * Field schema
 */
const fieldItemType = new GraphQLInputObjectType({
    name: 'FieldItem',
    description: 'A sub-parameter item',
    fields: {
        name: {
            description: 'The parameter name',
            type: GraphQLString
        },
        value: {
            description: 'The parameter value',
            type: GraphQLString
        }
    }
});

/**
 * Parameter schema
 */
const parameterItemType = new GraphQLInputObjectType({
    name: 'ParameterItem',
    description: 'It define a single parameter associated to the node. It\'s possible to define nested sub-parameters',
    fields: {
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
    }
});

/**
 * Context item
 */
const contextItemType = new GraphQLInputObjectType({
    name: 'ContextItem',
    description: 'A context item is a single selection made by the user',
    fields: {
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
    }
});

/**
 * Support item
 */
const supportItemType = new GraphQLInputObjectType({
    name: 'SupportItem',
    description: 'Support service item. It allows the definition of the requested support service name or category. If a service is requested by the name the fields name and operation are mandatory. Otherwise it\'s sufficient to specify a category' ,
    fields: {
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
    }
});

/**
 * Data schema
 */
const dataType = new GraphQLObjectType({
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

/**
 * Support response schema
 */
const supportResponseType = new GraphQLObjectType ({
    name: 'SupportResponse',
    description: 'It contains list of support service descriptions',
    fields: {
        name: {
            description: 'The name of the service',
            type: GraphQLString
        },
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
    }
});

/**
 * Response schema
 */
const responseType = new GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: {
        data: {
            description: 'Provide the list of result items',
            type: new GraphQLList(dataType)
        },
        support: {
            description: 'Provide the URL of the requested support services',
            type: new GraphQLList(supportResponseType)
        }
    }
});

/**
 * Schema for GraphQL query
 */
const queryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The main type for each operation',
    fields: {
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
                return executionHelper
                    .prepareResponse({_id, context, support})
                    .catch(e => {
                        throw new Error(e);
                    });
            }
        }
    }
});

/**
 * The main schema
 */
const camusSchema = new GraphQLSchema({
    query: queryType
});

export default camusSchema;