'use strict'

import {
    connectionFromPromisedArray,
    connectionArgs,
    connectionDefinitions,
} from 'graphql-relay'

import {
    GraphQLList
} from 'graphql'

import primaryData from './primaryDataSchema'
import supportData from './supportDataSchema'

import {
    getPrimaryData,
    getSupportData
} from './../../components/executionHelper'

/**
 * Create a connection related to the primary service request
 * @returns {{type, args, resolve: resolve}} A GraphQLFieldConfig object with the configuration for the primary connection
 */
export function primaryConnection () {
    const {connectionType} = connectionDefinitions({
        name: 'Primary',
        nodeType: primaryData,
        connectionFields: () => ({
            data: {
                type: new GraphQLList(primaryData),
                description: 'The list of results items',
                resolve: (conn) => conn.edges.map(edge => edge.node)
            }
        })
    })
    return {
        type: connectionType,
        args: connectionArgs,
        resolve: ({userMail, contextHash, decoratedCdt, connectionId}, args) => {
            return connectionFromPromisedArray(getPrimaryData(userMail, contextHash, decoratedCdt, args, connectionId), args)
        }
    }
}

/**
 * Create a connection related to the support service request
 * @returns {{type, args, resolve: resolve}} A GraphQLFieldConfig object with the configuration for the support connection
 */
export function supportConnection () {
    const {connectionType} = connectionDefinitions({
        name: 'Support',
        nodeType: supportData,
        connectionFields: () => ({
            data: {
                type: new GraphQLList(supportData),
                description: 'The list of support services found',
                resolve: (conn) => conn.edges.map(edge => edge.node)
            }
        })
    })
    return {
        type: connectionType,
        args: connectionArgs,
        resolve: ({userMail, contextHash, decoratedCdt}, args) => {
            return connectionFromPromisedArray(getSupportData(decoratedCdt), args)
        }
    }
}