'use strict';

let graphql = require('graphql');
let Promise = require('bluebird');

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
let fieldItemSchema = new graphql.GraphQLInputObjectType({
    name: 'FieldItem',
    description: 'A sub-parameter item',
    fields: {
        name: {
            description: 'The parameter name',
            type: graphql.GraphQLString
        },
        value: {
            description: 'The parameter value',
            type: graphql.GraphQLString
        }
    }
});

/**
 * Parameter schema
 */
let parameterItemSchema = new graphql.GraphQLInputObjectType({
    name: 'ParameterItem',
    description: 'It define a single parameter associated to the node. It\'s possible to define nested sub-parameters',
    fields: {
        name: {
            description: 'The parameter name',
            type: graphql.GraphQLString
        },
        value: {
            description: 'The parameter value',
            type: graphql.GraphQLString
        },
        fields: {
            description: 'The list of sub-parameters',
            type: new graphql.GraphQLList(fieldItemSchema)
        }
    }
});

/**
 * Context item
 */
let contextItemSchema = new graphql.GraphQLInputObjectType({
    name: 'ContextItem',
    description: 'A context item is a single selection made by the user',
    fields: {
        dimension: {
            description: 'The selected dimension. It can be also a parameter name',
            type: graphql.GraphQLString
        },
        value: {
            description: 'The value selected',
            type: graphql.GraphQLString
        },
        parameters: {
            description: 'The list of parameters associated to the node',
            type: new graphql.GraphQLList(parameterItemSchema)
        }
    }
});

/**
 * Support item
 */
let supportItemSchema = new graphql.GraphQLInputObjectType({
    name: 'SupportItem',
    description: 'Support service item. It allows the definition of the requested support service name or category. If a service is requested by the name the fields name and operation are mandatory. Otherwise it\'s sufficient to specify a category' ,
    fields: {
        name: {
            description: 'The support service name',
            type: graphql.GraphQLString
        },
        operation: {
            description: 'The support service operation name',
            type: graphql.GraphQLString
        },
        category: {
            description: 'The support service category',
            type: graphql.GraphQLString
        }
    }
});

/**
 * Context schema
 */
let contextSchema = new graphql.GraphQLInputObjectType({
    name: 'Context',
    description: 'The context item. It describes the user context',
    fields: {
        _id: {
            description: 'The CDT identifier',
            type: graphql.GraphQLString
        },
        context: {
            description: 'The list of context preferences',
            type: new graphql.GraphQLList(contextItemSchema)
        },
        support: {
            description: 'The list of support services that are requested',
            type: new graphql.GraphQLList(supportItemSchema)
        }
    }
});

/**
 * Data schema
 */
let dataSchema = new graphql.GraphQLObjectType({
    name: 'DataItem',
    description: 'A single result item',
    fields: {
        title: {
            description: 'The title of the item',
            type: graphql.GraphQLString
        },
        address: {
            description: 'The address of the item',
            type: graphql.GraphQLString
        },
        telephone: {
            description: 'The telephone number',
            type: graphql.GraphQLString
        },
        website: {
            description: 'The website url',
            type: graphql.GraphQLString
        },
        city: {
            description: 'The city where the item is',
            type: graphql.GraphQLString
        },
        email: {
            description: 'The email address',
            type: graphql.GraphQLString
        },
        latitude: {
            description: 'The latitude of the item',
            type: graphql.GraphQLString
        },
        longitude: {
            description: 'The longitude of the item',
            type: graphql.GraphQLString
        }
    }
});

/**
 * Support response schema
 */
let supportResponseSchema = new graphql.GraphQLObjectType ({
    name: 'SupportResponse',
    description: 'It contains list of support service descriptions',
    fields: {
        name: {
            description: 'The name of the service',
            type: graphql.GraphQLString
        },
        category: {
            description: 'The category that the service belongs to',
            type: graphql.GraphQLString
        },
        service: {
            description: 'The service provider',
            type: graphql.GraphQLString
        },
        url: {
            description: 'The service URL',
            type: graphql.GraphQLString
        }
    }
});

/**
 * Response schema
 */
let responseSchema = new graphql.GraphQLObjectType({
    name: 'Response',
    description: 'The response type. It contains the information retrieved by the services',
    fields: {
        data: {
            description: 'Provide the list of result items',
            type: new graphql.GraphQLList(dataSchema)
        },
        support: {
            description: 'Provide the URL of the requested support services',
            type: new graphql.GraphQLList(supportResponseSchema)
        }
    }
});

/**
 * Schema for GraphQL query
 */
let querySchema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
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

module.exports = {querySchema};