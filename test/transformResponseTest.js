var assert = require('assert');
var transformResponse = require('../components/transformResponse.js');

describe('Component: TransformResponse', function () {

    describe('#mappingResponse()', function () {
        it('check if the mapping is done correctly', function () {
            return transformResponse
                .mappingResponse(googlePlacesMapping, googlePlacesResponse)
                .then(function (data) {
                    console.log(data);
                });
        });
    });

});

var googlePlacesMapping = {
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
};

var mappingWithFunction = {
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
            run: 'return \'Restaurant \' + value;'
        }
    ]
};

var eventfulMapping = {
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
};

var googlePlacesResponse = {
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
};

var eventfulResponse = {
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
                "description":" Making plans for an early dinner, or looking for a great spot to ring in the New Year?    Join us this year for an amazing Food & Wine Lover&#39;s New Year&#39;s Eve at Volo Restaurant Wine Bar  New Year&#39;s Eve at Volo:  Whether you need a great spot to indulge in a special dinner before [...] <br> <br>(773) 348-4600",
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
};