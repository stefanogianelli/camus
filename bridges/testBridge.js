import Promise from 'bluebird'

import Bridge from './bridge'

/**
 * TestBridge
 */
export default class extends Bridge {

    /**
     * It allows to execute custom queries to web service
     * @returns {bluebird|exports|module.exports} The response provided by the service, in JSON format
     */
    executeQuery () {
        return new Promise (resolve => {
            resolve({
                "response": {
                    "results": [
                        {
                            "formatted_address": "809 W Randolph St, Chicago, IL 60607, Stati Uniti",
                            "geometry": {
                                "location": {
                                    "lat": 41.8841133,
                                    "lng": -87.6480041
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
                                        "<a href=\"https://maps.google.com/maps/contrib/106459181957883771107\">Arlene Wang</a>"
                                    ],
                                    "photo_reference": "CmRdAAAA_qmHD1CC4wkZ2ZyY7lEnH_DDPsebTdfcgtHPZr5eUNsabxikxtmZvhuSo07U7GZMV0qKEFlYSgyqIYD6GfFkIK7hfrbDxbVeXxbT7IJYgvHwKicX4jZJt0c3l8udX-nuEhCFpBikAs8LwQO1c7-t07YhGhTIlj4p3ES9_ALGqmKPEalthF2VHw",
                                    "width": 2048
                                }
                            ],
                            "place_id": "ChIJs8mbNsUsDogRUnpg-b_IK5E",
                            "price_level": 2,
                            "rating": 4.6,
                            "reference": "CnRjAAAAmk5xr5rWXPxxhsMAV_X8FKQTLeic18cMjxOq1G4WlUjugGpRaJp7F8gm1gtB8B2abaW6ndis95iIBdUOQ62kRdfOnjyerxHwBxgE72uSj6DdDNgFjGAi3lJT3OWzCCRtMolfQVobpNJ7bJEXTfsUuRIQ7ESBiIyS9YsCmZQlA6sQpBoUgxzxTlWrnjbsxHUeMTkJD_3bM3U",
                            "types": [
                                "restaurant",
                                "food",
                                "point_of_interest",
                                "establishment"
                            ]
                        },
                        {
                            "formatted_address": "500 N Michigan Ave, Chicago, IL 60611, Stati Uniti",
                            "geometry": {
                                "location": {
                                    "lat": 41.89114589999999,
                                    "lng": -87.62469829999999
                                }
                            },
                            "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/bar-71.png",
                            "id": "6527030e5057a767208be29502b15f5d003bc30f",
                            "name": "The Purple Pig",
                            "opening_hours": {
                                "open_now": false,
                                "weekday_text": []
                            },
                            "photos": [
                                {
                                    "height": 1632,
                                    "html_attributions": [
                                        "<a href=\"https://maps.google.com/maps/contrib/104117192501575883019\">Robert Elroy</a>"
                                    ],
                                    "photo_reference": "CmRdAAAA6LDUqsal5Ou7yxd54Hxq7PYUvRj5yBoixDURYoQXIBYWU0TIr5Evx6XVR-xZUauxYpLCE4uhq6m8ua4n8Bg2G-mMRbLZXFKcQUk2c_hxGyqnWz3-FJaqhwtcNK1nIcdiEhAhvQ9FquHuTfk8b7qiBtujGhTG6zj2sA_zjnWyS1Oc4zpZbuTcng",
                                    "width": 1224
                                }
                            ],
                            "place_id": "ChIJl8NTEawsDogRwXH-IVDyH2A",
                            "price_level": 2,
                            "rating": 4.4,
                            "reference": "CnRhAAAA2DLsNd9gswsQEfZDujkzXubyTwuWWnXcd-8qiV57RSskYrjV7XMJjuWbmm5oyxQ190D-syqD7ylffuDcxnJt3qcghhg6slu9rm_7ddC0fEGFES9noKO_nWLTyl41Hlmv_C1-Q-qnsUR5XKygYG87IBIQ4RVO5U8_0x990iCnQWJ6OBoUPaqzqIoCMKhnNTF8MvLhrbwICmM",
                            "types": [
                                "bar",
                                "restaurant",
                                "food",
                                "point_of_interest",
                                "establishment"
                            ]
                        }
                    ]
                }
            })
        })
    }
}
