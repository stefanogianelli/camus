import {
    nodeDefinitions,
    fromGlobalId,
} from 'graphql-relay';

import {
    getDecoratedCdt
} from './../../components/executionHelper';

import {
    unbase64
} from '../../utils/base64';

import {
    responseType
} from './rootSchema';

export const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const {id} = fromGlobalId(globalId);
        const decoratedCdt = JSON.parse(unbase64(id));
        return getDecoratedCdt(decoratedCdt);
    },
    () => {
        return responseType;
    }
);