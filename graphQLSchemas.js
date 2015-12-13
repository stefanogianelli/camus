'use strict';

let graphql = require('graphql');

let fieldItem = new graphql.GraphQLInputObjectType({
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

let parameterItem = new graphql.GraphQLInputObjectType({
    name: 'ParameterItem',
    fields: {
        name: {
            type: graphql.GraphQLString
        },
        value: {
            type: graphql.GraphQLString
        },
        fields: {
            type: new graphql.GraphQLList(fieldItem)
        }
    }
});

let contextItem = new graphql.GraphQLInputObjectType({
    name: 'ContextItem',
    fields: {
        dimension: {
            type: graphql.GraphQLString
        },
        value: {
            type: graphql.GraphQLString
        },
        parameters: {
            type: new graphql.GraphQLList(parameterItem)
        }
    }
});

let supportItem = new graphql.GraphQLInputObjectType({
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

let contextSchema = new graphql.GraphQLInputObjectType({
    name: 'Context',
    fields: {
        _id: {
            type: graphql.GraphQLString
        },
        context: {
            type: new graphql.GraphQLList(contextItem)
        },
        support: {
            type: new graphql.GraphQLList(supportItem)
        }
    }
});

let dataSchema = new graphql.GraphQLObjectType({
    name: 'DataItem',
    fields: {
        title: {
            type: graphql.GraphQLString
        },
        address: {
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

let responseSchema = new graphql.GraphQLObjectType({
    name: 'Response',
    fields: {
        data: {
            type: new graphql.GraphQLList(dataSchema)
        }
    }
});

module.exports = {contextSchema, responseSchema};