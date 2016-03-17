'use strict'

import assert from 'assert'

import ResponseParser from '../src/components/responseParser'

const responseParser = new ResponseParser()

describe('Component: ResponseParser', () => {

    describe('#retrieveListOfResults()', () => {
        it('check if the transform operation is done correctly', () => {
            const array = responseParser._retrieveListOfResults(googlePlacesResponse, googlePlacesMapping.list)
            assert.equal(array.length, 2)
        })
        it('check behaviour when the root element doesn\'t have an array nor an object', () => {
            const array = responseParser._retrieveListOfResults(stringResponse, 'data')
            assert.equal(array.length, 0)
        })
        it('check error message when no response is specified', () => {
            try {
                responseParser._retrieveListOfResults()
            } catch (e) {
                assert.equal(e.message, 'Empty response. Please add a response to be mapped')
            }
        })
    })

    describe('#mappingResponse()', () => {
        it('check if the mapping is done correctly', () => {
            return responseParser
                .mappingResponse(googlePlacesResponse, googlePlacesMapping)
                .then(data => {
                    assert.equal(data[0].title, 'Girl & the Goat')
                    assert.equal(data[0].address, '809 W Randolph St, Chicago, IL 60607, Stati Uniti')
                    assert.equal(data[0].latitude, 41.8841133)
                    assert.equal(data[0].longitude, -87.6480041)
                    assert.equal(data[1].title, 'Bandera')
                    assert.equal(data[1].address, '535 N Michigan Ave, Chicago, IL 60611, Stati Uniti')
                    assert.equal(data[1].latitude, 41.8918882)
                    assert.equal(data[1].longitude, -87.62385739999999)
                })
        })
        it('check if a custom function on an attribute is correctly executed', () => {
            return responseParser
                .mappingResponse(googlePlacesResponse, mappingWithFunction)
                .then(data => {
                    assert.equal(data[0].title, 'Restaurant Girl & the Goat')
                    assert.equal(data[0].address, '809 W Randolph St, Chicago, IL 60607, Stati Uniti')
                    assert.equal(data[0].latitude, 41.8841133)
                    assert.equal(data[0].longitude, -87.6480041)
                    assert.equal(data[1].title, 'Restaurant Bandera')
                    assert.equal(data[1].address, '535 N Michigan Ave, Chicago, IL 60611, Stati Uniti')
                    assert.equal(data[1].latitude, 41.8918882)
                    assert.equal(data[1].longitude, -87.62385739999999)
                })
        })
        it('check if a function on a non existent attribute doesn\'t change the response', () => {
            return responseParser
                .mappingResponse(googlePlacesResponse, mappingWithInvalidFunction)
                .then(data => {
                    assert.equal(data[0].title, 'Girl & the Goat')
                    assert.equal(data[0].address, '809 W Randolph St, Chicago, IL 60607, Stati Uniti')
                    assert.equal(data[0].latitude, 41.8841133)
                    assert.equal(data[0].longitude, -87.6480041)
                    assert.equal(typeof data[0].website, 'undefined')
                    assert.equal(data[1].title, 'Bandera')
                    assert.equal(data[1].address, '535 N Michigan Ave, Chicago, IL 60611, Stati Uniti')
                    assert.equal(data[1].latitude, 41.8918882)
                    assert.equal(data[1].longitude, -87.62385739999999)
                    assert.equal(typeof data[1].website, 'undefined')
                })
        })
        it('check if nested base list is correctly handled', () => {
            return responseParser
                .mappingResponse(eventfulResponse, eventfulMapping)
                .then(data => {
                    assert.equal(data[0].title, 'Wine Lover\'s New Year\'s Eve at Volo Restaurant Wine Bar')
                    assert.equal(data[0].address, '2008 West Roscoe')
                    assert.equal(data[0].latitude, '41.9433228')
                    assert.equal(data[0].longitude, '-87.6788849')
                    assert.equal(data[1].title, 'National Restaurant Association')
                    assert.equal(data[1].address, '2301 S. Lake Shore Drive')
                    assert.equal(data[1].latitude, '41.854092')
                    assert.equal(data[1].longitude, '-87.6127372')
                })
        })
        it('check if null values are deleted from the response', () => {
            return responseParser
                .mappingResponse(eventfulResponse, mappgingWithNullValue)
                .then(data => {
                    assert.equal(typeof data[0].count, 'undefined')
                    assert.equal(typeof data[1].count, 'undefined')
                })
        })
        it('check root and non array base list is correctly handled', () => {
            return responseParser
                .mappingResponse(cinemaResponse, cinemaMapping)
                .then(data => {
                    assert.equal(data[0].title, 'Cinema Pierrot')
                    assert.equal(data[0].address, 'Via Camillo De Meis, 58')
                    assert.equal(data[0].telephone, '+39 0815 967 802')
                    assert.equal(data[0].latitude, '40.85151')
                    assert.equal(data[0].longitude, '14.333234')
                    assert.equal(data[1].title, 'Cinema Ambasciatori')
                    assert.equal(data[1].address, 'Via Francesco Crispi, 33')
                    assert.equal(data[1].telephone, '+39 0817 613 128')
                    assert.equal(data[1].latitude, '40.836518')
                    assert.equal(data[1].longitude, '14.231663')
                    assert.equal(data[2].title, 'Cinema Acacia')
                    assert.equal(data[2].address, 'Via Raffaele Tarantino, 10')
                    assert.equal(data[2].telephone, '+39 081 5563999')
                    assert.equal(data[2].latitude, '40.849546')
                    assert.equal(data[2].longitude, '14.230291')
                })
        })
        it('check error message when no response is specified', () => {
            return responseParser
                .mappingResponse()
                .catch(e => {
                    assert.equal(e, 'Empty response. Please add a response to be mapped')
                })
        })
        it('check error when no descriptor is provided', () => {
            return responseParser
                .mappingResponse(googlePlacesResponse)
                .catch(e => {
                    assert.equal(e, 'No descriptor defined. Please add a descriptor for the current service')
                })
        })
        it('check error when no mapping is defined', () => {
            return responseParser
                .mappingResponse(googlePlacesResponse, {})
                .catch(e => {
                    assert.equal(e, 'No mapping defined. Please add a mapping for the current service')
                })
        })
    })

})

const googlePlacesMapping = {
    service: {
        name: 'GooglePlaces',
        rank: 1
    },
    responseMapping: {
        list: 'results',
        items: [
            {
                path: 'name',
                termName: 'title'
            },
            {
                path: 'formatted_address',
                termName: 'address'
            },
            {
                path: 'geometry.location.lat',
                termName: 'latitude'
            },
            {
                path: 'geometry.location.lng',
                termName: 'longitude'
            }
        ]
    }
}

const mappingWithFunction = {
    service: {
        name: 'GooglePlaces',
        rank: 1
    },
    responseMapping: {
        list: 'results',
        items: [
            {
                path: 'name',
                termName: 'title'
            },
            {
                path: 'formatted_address',
                termName: 'address'
            },
            {
                path: 'geometry.location.lat',
                termName: 'latitude'
            },
            {
                path: 'geometry.location.lng',
                termName: 'longitude'
            }
        ],
        functions: [
            {
                onAttribute: 'title',
                run: 'return \'Restaurant \' + value'
            }
        ]
    }
}

const mappingWithInvalidFunction = {
    service: {
        name: 'GooglePlaces',
        rank: 1
    },
    responseMapping: {
        list: 'results',
        items: [
            {
                path: 'name',
                termName: 'title'
            },
            {
                path: 'formatted_address',
                termName: 'address'
            },
            {
                path: 'geometry.location.lat',
                termName: 'latitude'
            },
            {
                path: 'geometry.location.lng',
                termName: 'longitude'
            }
        ],
        functions: [
            {
                onAttribute: 'website',
                run: 'return \'Restaurant \' + value'
            }
        ]
    }
}

const eventfulMapping = {
    service: {
        name: 'Eventful',
        rank: 1
    },
    responseMapping: {
        list: 'events.event',
        items: [
            {
                path: 'title',
                termName: 'title'
            },
            {
                path: 'venue_address',
                termName: 'address'
            },
            {
                path: 'latitude',
                termName: 'latitude'
            },
            {
                path: 'longitude',
                termName: 'longitude'
            }
        ]
    }
}

const mappgingWithNullValue = {
    service: {
        name: 'Eventful',
        rank: 1
    },
    responseMapping: {
        list: 'events.event',
        items: [
            {
                path: 'title',
                termName: 'title'
            },
            {
                path: 'venue_address',
                termName: 'address'
            },
            {
                path: 'latitude',
                termName: 'latitude'
            },
            {
                path: 'longitude',
                termName: 'longitude'
            },
            {
                path: 'watching_count',
                termName: 'count'
            }
        ]
    }
}

const cinemaMapping = {
    service: {
        name: 'Cinema',
        rank: 1
    },
    responseMapping: {
        items: [
            {
                termName: 'title',
                path: 'nome'
            },
            {
                termName: 'address',
                path: 'indirizzo'
            },
            {
                termName: 'telephone',
                path: 'telefono'
            },
            {
                termName: 'website',
                path: 'sito'
            },
            {
                termName: 'latitude',
                path: 'latitudine'
            },
            {
                termName: 'longitude',
                path: 'longitudine'
            }
        ]
    }
}

const googlePlacesResponse = {
    "html_attributions": [],
    "results": [
        {
            "formatted_address": "809 W Randolph St, Chicago, IL 60607, Stati Uniti",
            "geometry": {
                "location": {
                    "lat": 41.8841133,
                    "lng": -87.64800409999999
                }
            },
            "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
            "id": "d224332900f932b7de863b9083ccf7b6ec036111",
            "name": "Girl & the Goat",
            "opening_hours": {
                "open_now": false,
                "weekday_text": []
            },
            "photos": [
                {
                    "height": 1371,
                    "html_attributions": [
                        "\u003ca href=\"https://maps.google.com/maps/contrib/106459181957883771107/photos\"\u003eArlene Wang\u003c/a\u003e"
                    ],
                    "photo_reference": "CmRdAAAA5KbiUi4ZKexc-b5oX9iA3UsmeqvgkzCwzz6haJ5KtxJJ2wh4_P68ODrJINuJMAnQ64lO3dBI5qhWldY85aCBYSfRUOt_jW9eoZE29zCm-KhMfJK0p0nZc8ph277jQtIGEhCM8j1-tc75nEXbeKgysMhmGhSULgjxGLfsS76HUgXLzD29iU5TrA",
                    "width": 2048
                }
            ],
            "place_id": "ChIJs8mbNsUsDogRUnpg-b_IK5E",
            "price_level": 2,
            "rating": 4.6,
            "reference": "CnRjAAAADxj7S8XqfLrXLOkEF_BwOlq62Wnb1KBikXqh9fNCS4KTJthL9nCZ70GaRyrpFvT9z4Td_ahqCfR1osyP8Awbk6SbI_GAmJYf4i7g0sJQvvJemg9DltXqpP5KIIoa1h7sHfhnjhlsTfCQAZsJ53haExIQYlxrJBw3aGMBlzsdDq-KixoUrQY39EDVVcHYJm3xc_3JNff5bEQ",
            "types": ["restaurant", "food", "point_of_interest", "establishment"]
        },
        {
            "formatted_address": "535 N Michigan Ave, Chicago, IL 60611, Stati Uniti",
            "geometry": {
                "location": {
                    "lat": 41.8918882,
                    "lng": -87.62385739999999
                }
            },
            "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
            "id": "b81ffca558b39fd8f5dcc99f46dfeb51fd693541",
            "name": "Bandera",
            "opening_hours": {
                "open_now": false,
                "weekday_text": []
            },
            "photos": [
                {
                    "height": 1350,
                    "html_attributions": [
                        "\u003ca href=\"https://maps.google.com/maps/contrib/114051225232196891758/photos\"\u003eBandera\u003c/a\u003e"
                    ],
                    "photo_reference": "CmRdAAAAPywcJbcF8xKMH7B-5D4XYbCrm-Q-Htkj7GJEq4wkvfe3MhOEZ1m-aQsyH5GypPsnA6npitKGkUQdmSlR_Psj9AevIS12EXhFCGctwRQvXN-XbMSUjKaXIKUiTgK-Tc5QEhCpTs1F0xTPXxNsr4-H9o8rGhR6HB5jKgRX8X3tYWpyQnEa4SQl-g",
                    "width": 1347
                }
            ],
            "place_id": "ChIJkzrKcawsDogRmmr3XEBfoj4",
            "price_level": 2,
            "rating": 4.4,
            "reference": "CmRaAAAApVN4B3sTocBAnscxzoaISHMIXz-h4EjEJ806AbTQN9o9wk_t6rby7EOtnlUH9epNqZfLb8iDfOIBTL3IHoMJXJNZ0p3T8rjwhStM-0G7VYt-ETdS2XSxYiSj8tD5LgCGEhABvPAxT_jvltTkclSMW0E5GhSViqi77YzO5riKf5JQ6dmhhqHw_Q",
            "types": ["restaurant", "food", "point_of_interest", "establishment"]
        }
    ]
}

const eventfulResponse = {
    "last_item":null,
    "total_items":"235",
    "first_item":null,
    "page_number":"1",
    "page_size":"10",
    "page_items":null,
    "search_time":"0.2",
    "page_count":"24",
    "events":{
        "event":[
            {
                "watching_count":null,
                "olson_path":"America/Chicago",
                "calendar_count":null,
                "comment_count":null,
                "region_abbr":"IL",
                "postal_code":"60618",
                "going_count":null,
                "all_day":"0",
                "latitude":"41.9433228",
                "groups":null,
                "url":"http://chicago.eventful.com/events/wine-lovers-new-years-eve-volo-restaurant-wine-b-/E0-001-087924123-7?utm_source=apis&utm_medium=apim&utm_campaign=apic",
                "id":"E0-001-087924123-7",
                "privacy":"1",
                "city_name":"Chicago",
                "link_count":null,
                "longitude":"-87.6788849",
                "country_name":"United States",
                "country_abbr":"USA",
                "region_name":"Illinois",
                "start_time":"2015-12-31 17:00:00",
                "tz_id":null,
                "description":" Making plans for an early dinner, or looking for a great spot to ring in the New Year?    Join us this year for an amazing Food & Wine Lover&#39s New Year&#39s Eve at Volo Restaurant Wine Bar  New Year&#39s Eve at Volo:  Whether you need a great spot to indulge in a special dinner before [...] <br> <br>(773) 348-4600",
                "modified":"2015-10-06 01:40:52",
                "venue_display":"1",
                "tz_country":null,
                "performers":null,
                "title":"Wine Lover's New Year's Eve at Volo Restaurant Wine Bar",
                "venue_address":"2008 West Roscoe",
                "geocode_type":"EVDB Geocoder",
                "tz_olson_path":null,
                "recur_string":null,
                "calendars":null,
                "owner":"evdb",
                "going":null,
                "country_abbr2":"US",
                "image":{
                    "small":{
                        "width":"48",
                        "url":"http://s3.evcdn.com/images/small/I0-001/007/490/118-9.png_/wine-lovers-new-years-eve-volo-restaurant-wine-bar-18.png",
                        "height":"48"
                    },
                    "width":"48",
                    "caption":null,
                    "medium":{
                        "width":"128",
                        "url":"http://s3.evcdn.com/images/medium/I0-001/007/490/118-9.png_/wine-lovers-new-years-eve-volo-restaurant-wine-bar-18.png",
                        "height":"128"
                    },
                    "url":"http://s3.evcdn.com/images/small/I0-001/007/490/118-9.png_/wine-lovers-new-years-eve-volo-restaurant-wine-bar-18.png",
                    "thumb":{
                        "width":"48",
                        "url":"http://s3.evcdn.com/images/thumb/I0-001/007/490/118-9.png_/wine-lovers-new-years-eve-volo-restaurant-wine-bar-18.png",
                        "height":"48"
                    },
                    "height":"48"
                },
                "created":"2015-10-06 01:40:52",
                "venue_id":"V0-001-000264493-1",
                "tz_city":null,
                "stop_time":null,
                "venue_name":"Volo Restaurant Wine Bar",
                "venue_url":"http://chicago.eventful.com/venues/volo-restaurant-wine-bar-/V0-001-000264493-1?utm_source=apis&utm_medium=apim&utm_campaign=apic"
            },
            {
                "watching_count": null,
                "olson_path": "America/Chicago",
                "calendar_count": null,
                "comment_count": null,
                "region_abbr": "IL",
                "postal_code": "60616",
                "going_count": null,
                "all_day": "2",
                "latitude": "41.854092",
                "groups": null,
                "url": "http://chicago.eventful.com/events/national-restaurant-association-/E0-001-075877851-7?utm_source=apis&utm_medium=apim&utm_campaign=apic",
                "id": "E0-001-075877851-7",
                "privacy": "1",
                "city_name": "Chicago",
                "link_count": null,
                "longitude": "-87.6127372",
                "country_name": "United States",
                "country_abbr": "USA",
                "region_name": "Illinois",
                "start_time": "2016-05-21 00:00:00",
                "tz_id": null,
                "description": " National Restaurant Association is happening on 21 May 2016 at McCormick Place Convention Center Chicago, United States Of America. Its a premier event in Hotel, Restaurant & Catering industry. <br><br><a href=\"http://login.10times.com/stall-book/6266\" rel=\"nofollow\">Book a stall at 10times.com!</a>",
                "modified": "2015-07-11 13:31:06",
                "venue_display": "1",
                "tz_country": null,
                "performers": null,
                "title": "National Restaurant Association",
                "venue_address": "2301 S. Lake Shore Drive",
                "geocode_type": "EVDB Geocoder",
                "tz_olson_path": null,
                "recur_string": null,
                "calendars": null,
                "owner": "evdb",
                "going": null,
                "country_abbr2": "US",
                "image": {
                    "small": {
                        "width": "48",
                        "url": "http://s4.evcdn.com/images/small/I0-001/017/458/863-9.jpeg_/national-restaurant-association-63.jpeg",
                        "height": "48"
                    },
                    "width": "48",
                    "caption": null,
                    "medium": {
                        "width": "128",
                        "url": "http://s4.evcdn.com/images/medium/I0-001/017/458/863-9.jpeg_/national-restaurant-association-63.jpeg",
                        "height": "128"
                    },
                    "url": "http://s4.evcdn.com/images/small/I0-001/017/458/863-9.jpeg_/national-restaurant-association-63.jpeg",
                    "thumb": {
                        "width": "48",
                        "url": "http://s4.evcdn.com/images/thumb/I0-001/017/458/863-9.jpeg_/national-restaurant-association-63.jpeg",
                        "height": "48"
                    },
                    "height": "48"
                },
                "created": "2014-10-04 03:14:46",
                "venue_id": "V0-001-004815602-7",
                "tz_city": null,
                "stop_time": "2016-05-24 00:00:00",
                "venue_name": "McCormick Place Convention Center",
                "venue_url": "http://chicago.eventful.com/venues/mccormick-place-convention-center-/V0-001-004815602-7?utm_source=apis&utm_medium=apim&utm_campaign=apic"
            }
        ]
    }
}

const cinemaResponse = {
    "0": {
        "idCinema":65,
        "nome":"Cinema Pierrot",
        "citta":"Napoli",
        "indirizzo":"Via Camillo De Meis, 58",
        "telefono":"+39 0815 967 802",
        "sito":"",
        "orarioApertura":"21:15:00",
        "orarioChiusuraFeriali":"24:10:00",
        "orarioChiusuraFestivi":"01:10:00",
        "nSale":7,
        "latitudine":"40.85151",
        "longitudine":"14.333234",
        "accessoFacilitato":1,
        "3D":0,
        "prevendita":0
    },
    "1": {
        "idCinema":66,
        "nome":"Cinema Ambasciatori",
        "citta":"Napoli",
        "indirizzo":"Via Francesco Crispi, 33",
        "telefono":"+39 0817 613 128",
        "sito":"",
        "orarioApertura":"20:50:00",
        "orarioChiusuraFeriali":"01:15:00",
        "orarioChiusuraFestivi":"03:15:00",
        "nSale":5,
        "latitudine":"40.836518",
        "longitudine":"14.231663",
        "accessoFacilitato":1,
        "3D":0,
        "prevendita":1
    },
    "2": {
        "idCinema":67,
        "nome":"Cinema Acacia",
        "citta":"Napoli",
        "indirizzo":"Via Raffaele Tarantino, 10",
        "telefono":"+39 081 5563999",
        "sito":"",
        "orarioApertura":"17:35:00",
        "orarioChiusuraFeriali":"24:25:00",
        "orarioChiusuraFestivi":"00:25:00",
        "nSale":4,
        "latitudine":"40.849546",
        "longitudine":"14.230291",
        "accessoFacilitato":1,
        "3D":0,
        "prevendita":0
    }
}

const stringResponse = {
    data: 'No data found'
}