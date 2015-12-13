'use strict';

let graphql = require('graphql');

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

module.exports = {contextSchema, responseSchema};