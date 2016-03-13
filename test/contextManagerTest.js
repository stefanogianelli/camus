'use strict'

import assert from 'assert'
import Promise from 'bluebird'

import ContextManager from '../src/components/contextManager'
import MockDatabase from './mockDatabaseCreator'
import * as mockModel from './mockModel'

const contextManager = new ContextManager()
const mockDatabase = new MockDatabase()

let _idCDT = null
let _nestedCDT = null
let _multipleSonsCDT = null

describe('Component: ContextManager', () => {

    before(done => {
        mockDatabase.createDatabase((err, idCDT, nestedCDT, multipleSonsCDT) => {
            _idCDT = idCDT
            _nestedCDT = nestedCDT
            _multipleSonsCDT = multipleSonsCDT
            done(err)
        })
    })

    describe('#getDecoratedCdt()', () => {
        it('check if correct decorated CDT is generated', () => {
            return contextManager
                .getDecoratedCdt(context(_idCDT))
                .then(data => {
                    //filter nodes
                    assert.equal(data.filterNodes.length, 5)
                    assert.equal(data.filterNodes[0].name, 'InterestTopic')
                    assert.equal(data.filterNodes[0].value, 'Restaurant')
                    assert.equal(data.filterNodes[1].name, 'Budget')
                    assert.equal(data.filterNodes[1].value, 'Low')
                    assert.equal(data.filterNodes[2].name, 'Transport')
                    assert.equal(data.filterNodes[2].value, 'PublicTransport')
                    assert.equal(data.filterNodes[3].name, 'Tipology')
                    assert.equal(data.filterNodes[3].value, 'Bus')
                    assert.equal(data.filterNodes[4].name, 'Tipology')
                    assert.equal(data.filterNodes[4].value, 'Train')
                    //ranking nodes
                    assert.equal(data.rankingNodes.length, 2)
                    assert.equal(data.rankingNodes[0].name, 'Festivita')
                    assert.equal(data.rankingNodes[0].value, 'Capodanno')
                    assert.equal(data.rankingNodes[1].name, 'CityName')
                    assert.equal(data.rankingNodes[1].value, 'Milan')
                    //specific nodes
                    assert.equal(data.specificNodes.length, 1)
                    assert.equal(data.specificNodes[0].name, 'CityCoord')
                    assert.equal(data.specificNodes[0].fields[0].name, 'Latitude')
                    assert.equal(data.specificNodes[0].fields[0].value, '45.478906')
                    assert.equal(data.specificNodes[0].fields[1].name, 'Longitude')
                    assert.equal(data.specificNodes[0].fields[1].value, '9.234297')
                    //parameter nodes
                    assert.equal(data.parameterNodes.length, 4)
                    assert.equal(data.parameterNodes[0].name, 'CityName')
                    assert.equal(data.parameterNodes[0].value, 'Milan')
                    assert.equal(data.parameterNodes[1].name, 'Number')
                    assert.equal(data.parameterNodes[1].value, 4)
                    assert.equal(data.parameterNodes[2].name, 'Budget')
                    assert.equal(data.parameterNodes[2].value, 'Low')
                    assert.equal(data.parameterNodes[3].name, 'CityCoord')
                    assert.equal(data.parameterNodes[3].fields[0].name, 'Latitude')
                    assert.equal(data.parameterNodes[3].fields[0].value, '45.478906')
                    assert.equal(data.parameterNodes[3].fields[1].name, 'Longitude')
                    assert.equal(data.parameterNodes[3].fields[1].value, '9.234297')
                    //support service categories
                    assert.equal(data.supportServiceCategories.length, 1)
                    assert.equal(data.supportServiceCategories[0], 'Transport')
                })
        })
    })

    describe('#mergeCdtAndContext()', () => {
        it('check if a CDT and a context are correctly merged', () => {
            return contextManager
                ._mergeCdtAndContext(context(_idCDT))
                .then(({cdt, mergedCdt}) => {
                    assert.equal(mergedCdt.context[0].name, 'InterestTopic')
                    assert.equal(mergedCdt.context[0].for, 'filter')
                    assert.equal(mergedCdt.context[0].value, 'Restaurant')
                    assert.equal(mergedCdt.context[1].name, 'Festivita')
                    assert.equal(mergedCdt.context[1].for, 'ranking')
                    assert.equal(mergedCdt.context[1].value, 'Capodanno')
                    assert.equal(mergedCdt.context[2].name, 'Location')
                    assert.equal(mergedCdt.context[2].for, 'ranking|parameter')
                    assert.equal(mergedCdt.context[2].parameters[0].name, 'CityName')
                    assert.equal(mergedCdt.context[2].parameters[0].value, 'Milan')
                    assert.equal(mergedCdt.context[2].parameters[1].name, 'CityCoord')
                    assert.equal(mergedCdt.context[2].parameters[1].fields[0].name, 'Latitude')
                    assert.equal(mergedCdt.context[2].parameters[1].fields[0].value, '45.478906')
                    assert.equal(mergedCdt.context[2].parameters[1].fields[1].name, 'Longitude')
                    assert.equal(mergedCdt.context[2].parameters[1].fields[1].value, '9.234297')
                    assert.equal(mergedCdt.context[3].name, 'Guests')
                    assert.equal(mergedCdt.context[3].for, 'parameter')
                    assert.equal(mergedCdt.context[3].parameters[0].name, 'Number')
                    assert.equal(mergedCdt.context[3].parameters[0].value, 4)
                    assert.equal(mergedCdt.context[4].name, 'Budget')
                    assert.equal(mergedCdt.context[4].for, 'filter|parameter')
                    assert.equal(mergedCdt.context[4].value, 'Low')
                    assert.equal(mergedCdt.context[5].name, 'Transport')
                    assert.equal(mergedCdt.context[5].for, 'filter')
                    assert.equal(mergedCdt.context[5].value, 'PublicTransport')
                })
        })
        it('check error when an invalid CDT identifier is provided', () => {
            return contextManager
                ._mergeCdtAndContext(context(1))
                .catch(e => {
                    assert.equal(e, 'No CDT found for the provided identifier')
                })
        })
    })

    describe('#getFilterNodes()', () => {
        it('check if correct filter nodes are returned', () => {
            let results = contextManager._getFilterNodes(mergedCdt(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 5)
            assert.equal(results[0].name, 'InterestTopic')
            assert.equal(results[0].value, 'Restaurant')
            assert.equal(results[1].name, 'Budget')
            assert.equal(results[1].value, 'Low')
            assert.equal(results[2].name, 'Transport')
            assert.equal(results[2].value, 'PublicTransport')
            assert.equal(results[3].name, 'Tipology')
            assert.equal(results[3].value, 'Bus')
            assert.equal(results[4].name, 'Tipology')
            assert.equal(results[4].value, 'Train')
        })
    })

    describe('#getRankingNodes()', () => {
        it('check if correct ranking nodes are returned', () => {
            let results = contextManager._getRankingNodes(mergedCdt(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 2)
            assert.equal(results[0].name, 'CityName')
            assert.equal(results[0].value, 'Milan')
            assert.equal(results[1].name, 'Festivita')
            assert.equal(results[1].value, 'Capodanno')
        })
    })

    describe('#getParameterNodes()', () => {
        it('check if correct parameter nodes are returned', () => {
            let results = contextManager._getParameterNodes(mergedCdt(_idCDT).context)
            assert.equal(results.length, 4)
            assert.equal(results[0].name, 'CityName')
            assert.equal(results[0].value, 'Milan')
            assert.equal(results[1].name, 'Number')
            assert.equal(results[1].value, 4)
            assert.equal(results[2].name, 'Budget')
            assert.equal(results[2].value, 'Low')
            assert.equal(results[3].name, 'CityCoord')
            assert.equal(results[3].fields[0].name, 'Longitude')
            assert.equal(results[3].fields[0].value, '9.234297')
            assert.equal(results[3].fields[1].name, 'Latitude')
            assert.equal(results[3].fields[1].value, '45.478906')
        })
    })

    describe('#getSpecificNodes()', () => {
        it('check if correct specific nodes are returned', () => {
            let results = contextManager._getSpecificNodes(mergedCdt(_idCDT).context)
            assert.equal(results.length, 1)
            assert.equal(results[0].name, 'CityCoord')
            assert.equal(results[0].fields[0].name, 'Longitude')
            assert.equal(results[0].fields[0].value, '9.234297')
            assert.equal(results[0].fields[1].name, 'Latitude')
            assert.equal(results[0].fields[1].value, '45.478906')
        })
    })

    describe('#getNodes()', () => {
        it('check empty list when no nodes are selected', () => {
            let results = contextManager._getFilterNodes(onlyParameter(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 0)
            results = contextManager._getFilterNodes(onlyRanking(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 0)
            results = contextManager._getParameterNodes(onlyFilter(_idCDT).context)
            assert.equal(results.length, 0)
            results = contextManager._getParameterNodes(onlyRanking(_idCDT).context)
            assert.equal(results.length, 0)
            results = contextManager._getRankingNodes(onlyFilter(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 0)
            results = contextManager._getRankingNodes(onlyParameter(_idCDT).context, mockModel.cdt(1))
            assert.equal(results.length, 0)
            results = contextManager._getSpecificNodes(onlyFilter(_idCDT).context)
            assert.equal(results.length, 0)
            results = contextManager._getSpecificNodes(onlyParameter(_idCDT).context)
            assert.equal(results.length, 0)
            results = contextManager._getSpecificNodes(onlyRanking(_idCDT).context)
            assert.equal(results.length, 0)
        })
        it('check error when an invalid type is selected', () => {
            try {
                contextManager._getNodes('invalid', onlyFilter(_idCDT).context, false)
            } catch(e) {
                assert.equal(e.message, 'Invalid type selected')
            }
        })
        it('check error when an empty item list is provided', () => {
            try {
                contextManager._getNodes('filter', [], false)
            } catch(e) {
                assert.equal(e.message, 'No items selected')
            }
        })
    })

    describe('#getDescendants()', () => {
        it('check if correct descendants are returned', () => {
            const nodes = contextManager._getDescendants(mockModel.cdt(1), [{value: 'PublicTransport'}])
            assert.equal(nodes.length, 2)
            assert.equal(nodes[0].name, 'Tipology')
            assert.equal(nodes[0].value, 'Bus')
            assert.equal(nodes[1].name, 'Tipology')
            assert.equal(nodes[1].value, 'Train')
        })
        it('check if correct nested descendants are returned', () => {
            const nodes = contextManager._getDescendants(mockModel.nestedCdt(1), [{value: 'b'}])
            assert.equal(nodes[0].name, 'd')
            assert.equal(nodes[0].value, 'e')
            assert.equal(nodes[1].name, 'd')
            assert.equal(nodes[1].value, 'f')
            assert.equal(nodes[2].name, 'g')
            assert.equal(nodes[2].value, 'h')
            assert.equal(nodes[3].name, 'g')
            assert.equal(nodes[3].value, 'i')
        })
        it('check if correct multiple descendants are returned', () => {
            const nodes = contextManager._getDescendants(mockModel.multipleSonsCdt(1), [{value: 'd'}, {value: 'e'}])
            assert.equal(nodes[0].name, 'g')
            assert.equal(nodes[0].value, 'i')
            assert.equal(nodes[1].name, 'g')
            assert.equal(nodes[1].value, 'l')
            assert.equal(nodes[2].name, 'h')
            assert.equal(nodes[2].value, 'm')
            assert.equal(nodes[3].name, 'h')
            assert.equal(nodes[3].value, 'n')
        })
        it('check empty list in output when no nodes are specified', () => {
            const nodes = contextManager._getDescendants(mockModel.cdt(1), [])
            assert.equal(nodes.length, 0)
        })
    })

    after(done => {
        mockDatabase.deleteDatabase(err => {
            done(err)
        })
    })
})

//context used to test the merging function
let context = idCDT => {
    return {
        idCdt: idCDT,
        context: [
            {
                dimension: 'Location',
                parameters: [
                    {
                        name: 'CityName',
                        value: 'Milan'
                    },
                    {
                        name: 'CityCoord',
                        fields: [
                            {
                                name: 'Longitude',
                                value: '9.234297'
                            },
                            {
                                name: 'Latitude',
                                value: '45.478906'
                            }
                        ]
                    },
                    {
                        name: 'caso',
                        value: 'caso'
                    }
                ]
            },
            {
                dimension: 'test',
                value: 'test'
            },
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Festivita',
                value: 'Capodanno'
            },
            {
                dimension: 'InterestTopic',
                value: 'Restaurant'
            },
            {
                dimension: 'Guests',
                parameters: [
                    {
                        name: 'Number',
                        value: 4
                    }
                ]
            },
            {
                dimension: 'Budget',
                value: 'Low'
            },
            {
                dimension: 'Transport',
                value: 'PublicTransport'
            }
        ],
        support: ['Transport']
    }
}

//context used to test the decoration function
let mergedCdt = idCDT => {
    return {
        idCdt: idCDT,
        context: [
            {
                name: 'Location',
                for: 'ranking|parameter',
                parameters: [
                    {
                        name: 'CityName',
                        value: 'Milan'
                    },
                    {
                        name: 'CityCoord',
                        fields: [
                            {
                                name: 'Longitude',
                                value: '9.234297'
                            },
                            {
                                name: 'Latitude',
                                value: '45.478906'
                            }
                        ]
                    }
                ]
            },
            {
                name: 'Festivita',
                for: 'ranking',
                value: 'Capodanno'
            },
            {
                name: 'InterestTopic',
                for: 'filter',
                value: 'Restaurant'
            },
            {
                name: 'Guests',
                for: 'parameter',
                parameters: [
                    {
                        name: 'Number',
                        value: 4
                    }
                ]
            },
            {
                name: 'Budget',
                for: 'filter|parameter',
                value: 'Low'
            },
            {
                name: 'Transport',
                for: 'filter',
                value: 'PublicTransport'
            }
        ],
        support: ['Transport']
    }
}

let onlyFilter = (idCDT) => {
    return {
        idCdt: idCDT,
        context: [
            {
                dimension: 'InterestTopic',
                for: 'filter',
                value: 'Restaurant'
            }
        ]
    }
}

let onlyRanking = (idCDT) => {
    return {
        idCdt: idCDT,
        context: [
            {
                dimension: 'Festivita',
                for: 'ranking',
                value: 'Capodanno'
            }
        ]
    }
}

let onlyParameter = (idCDT) => {
    return {
        idCdt: idCDT,
        context: [
            {
                dimension: 'Budget',
                for: 'parameter',
                value: 'Low'
            }
        ]
    }
}