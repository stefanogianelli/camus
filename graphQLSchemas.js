'use strict';

import {
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql';

//let Promise = require('bluebird');
import Promise from 'bluebird';

//components
let contextManager = require('./components/contextManager.js');
let ContextManager = new contextManager();
let primaryService = require('./components/primaryServiceSelection.js');
let PrimaryService = new primaryService();
let queryHandler = require('./components/queryHandler.js');
let QueryHandler = new queryHandler();
let supportService = require('./components/supportServiceSelection.js');
let SupportService = new supportService();
let responseAggregator = require('./components/responseAggregator.js');
let ResponseAggregator = new responseAggregator();

/**
 * Field schema
 */
let fieldItemSchema = new GraphQLInputObjectType({
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
let parameterItemSchema = new GraphQLInputObjectType({
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
            type: new GraphQLList(fieldItemSchema)
        }
    }
});

/**
 * Context item
 */
let contextItemSchema = new GraphQLInputObjectType({
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
            type: new GraphQLList(parameterItemSchema)
        }
    }
});

/**
 * Support item
 */
let supportItemSchema = new GraphQLInputObjectType({
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
 * Context schema
 */
let contextSchema = new GraphQLInputObjectType({
    name: 'Context',
    description: 'The context item. It describes the user context',
    fields: {
        _id: {
            description: 'The CDT identifier',
            type: GraphQLString
        },
        context: {
            description: 'The list of context preferences',
            type: new GraphQLList(contextItemSchema)
        },
        support: {
            description: 'The list of support services that are requested',
            type: new GraphQLList(supportItemSchema)
        }
    }
});

/**
 * Data schema
 */
let dataSchema = new GraphQLObjectType({
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
let supportResponseSchema = new GraphQLObjectType ({
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
let responseSchema = new GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: {
        data: {
            description: 'Provide the list of result items',
            type: new GraphQLList(dataSchema)
        },
        support: {
            description: 'Provide the URL of the requested support services',
            type: new GraphQLList(supportResponseSchema)
        }
    }
});

/**
 * Schema for GraphQL query
 */
export let querySchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Root',
        description: 'The main type for each operation',
        fields: {
            executeQuery: {
                type: responseSchema,
                description: 'The endpoint committed to the query execution',
                args: {
                    context: {
                        description:'The user context. It will be used for service selection and data filtering',
                        type: contextSchema
                    }
                },
                resolve: (root, context) => {
                    return ContextManager
                        .getDecoratedCdt(context.context)
                        .then(decoratedCdt => {
                            return Promise
                                .props({
                                    primary: PrimaryService
                                        .selectServices(decoratedCdt)
                                        .then(services => {
                                            return QueryHandler
                                                .executeQueries(services, decoratedCdt);
                                        }),
                                    support: SupportService.selectServices(decoratedCdt)
                                });
                        })
                        .then(result => {
                            return ResponseAggregator.prepareResponse(result.primary, result.support);
                        })
                        .then(response => {
                            return response;
                        })
                        .catch(e => {
                            return e;
                        });
                }
            }
        }
    })
});