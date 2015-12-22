import {
    nodeDefinitions,
    fromGlobalId,
} from 'graphql-relay';

import {
    getPrimaryData,
    getSupportData
} from './../../components/executionHelper';

import {
    unbase64
} from '../../utils/base64';

import primaryData from './primaryDataSchema';
import supportData from './supportDataSchema';

export const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const {type, id} = fromGlobalId(globalId);
        const decoratedCdt = JSON.parse(unbase64(id));
        switch (type) {
            case 'primary':
                return getPrimaryData(decoratedCdt);
                break;
            case 'support':
                return getSupportData(decoratedCdt);
                break;
            default:
                return null;
        }
    },
    (obj) => {
        if (obj instanceof primaryData) {
            return primaryData;
        } else if (obj instanceof supportData) {
            return supportData;
        }
    }
);