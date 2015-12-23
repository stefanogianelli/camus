import {
    connectionFromPromisedArray,
    connectionArgs,
    connectionDefinitions,
} from 'graphql-relay';

import primaryData from './primaryDataSchema';
import supportData from './supportDataSchema';

import {
    getPrimaryData,
    getSupportData
} from './../../components/executionHelper';

/**
 * Create a connection related to the primary service request
 * @returns {{type, args, resolve: resolve}} A GraphQLFieldConfig object with the configuration for the primary connection
 */
export function primaryConnection () {
    const {connectionType} = connectionDefinitions({
        name: 'Primary',
        nodeType: primaryData
    });
    return {
        type: connectionType,
        args: connectionArgs,
        resolve: (decoratedCdt, args) => {
            return connectionFromPromisedArray(getPrimaryData(decoratedCdt), args);
        }
    };
}

/**
 * Create a connection related to the support service request
 * @returns {{type, args, resolve: resolve}} A GraphQLFieldConfig object with the configuration for the support connection
 */
export function supportConnection () {
    const {connectionType} = connectionDefinitions({
        name: 'Support',
        nodeType: supportData
    });
    return {
        type: connectionType,
        args: connectionArgs,
        resolve: (decoratedCdt, args) => {
            return connectionFromPromisedArray(getSupportData(decoratedCdt), args);
        }
    };
}