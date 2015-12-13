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
    fields: {
        name: {
            type: graphql.GraphQLString
        },
        value: {
            type: graphql.GraphQLString
        }
    }
});

/**
 * Parameter schema
 */
let parameterItemSchema = new graphql.GraphQLInputObjectType({
    name: 'ParameterItem',
    fields: {
        name: {
            type: graphql.GraphQLString
        },
        value: {
            type: graphql.GraphQLString
        },
        fields: {
            type: new graphql.GraphQLList(fieldItemSchema)
        }
    }
});

/**
 * Context item
 */
let contextItemSchema = new graphql.GraphQLInputObjectType({
    name: 'ContextItem',
    fields: {
        dimension: {
            type: graphql.GraphQLString
        },
        value: {
            type: graphql.GraphQLString
        },
        parameters: {
            type: new graphql.GraphQLList(parameterItemSchema)
        }
    }
});

/**
 * Support item
 */
let supportItemSchema = new graphql.GraphQLInputObjectType({
    name: 'SupportItem',
    fields: {
        name: {
            type: graphql.GraphQLString
        },
        operation: {
            type: graphql.GraphQLString
        },
        category: {
            type: graphql.GraphQLString
        }
    }
});

/**
 * Context schema
 */
let contextSchema = new graphql.GraphQLInputObjectType({
    name: 'Context',
    fields: {
        _id: {
            type: graphql.GraphQLString
        },
        context: {
            type: new graphql.GraphQLList(contextItemSchema)
        },
        support: {
            type: new graphql.GraphQLList(supportItemSchema)
        }
    }
});

/**
 * Data schema
 */
let dataSchema = new graphql.GraphQLObjectType({
    name: 'DataItem',
    fields: {
        title: {
            type: graphql.GraphQLString
        },
        address: {
            type: graphql.GraphQLString
        },
        telephone: {
            type: graphql.GraphQLString
        },
        website: {
            type: graphql.GraphQLString
        },
        city: {
            type: graphql.GraphQLString
        },
        email: {
            type: graphql.GraphQLString
        },
        latitude: {
            type: graphql.GraphQLString
        },
        longitude: {
            type: graphql.GraphQLString
        }
    }
});

/**
 * Support response schema
 */
let supportResponseSchema = new graphql.GraphQLObjectType ({
    name: 'SupportResponse',
    fields: {
        name: {
            type: graphql.GraphQLString
        },
        category: {
            type: graphql.GraphQLString
        },
        service: {
            type: graphql.GraphQLString
        },
        url: {
            type: graphql.GraphQLString
        }
    }
});

/**
 * Response schema
 */
let responseSchema = new graphql.GraphQLObjectType({
    name: 'Response',
    fields: {
        data: {
            type: new graphql.GraphQLList(dataSchema)
        },
        support: {
            type: new graphql.GraphQLList(supportResponseSchema)
        }
    }
});

/**
 * Schema for GraphQL query
 */
let querySchema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'Query',
        fields: {
            executeQuery: {
                type: responseSchema,
                args: {
                    context: {
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