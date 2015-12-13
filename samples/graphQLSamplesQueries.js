/**
 * Restaurant sample context
 */
let restaurantContext = `
    query Restaurant {
        executeQuery (
            context: {
                _id: "566d8aa73450c916059a5141",
                context: [
                    {
                        dimension: "InterestTopic",
                        value: "Restaurant"
                    },
                    {
                        dimension: "Location",
                        parameters: [
                            {
                                name: "CityName",
                                value: "Chicago"
                            }
                        ]
                    },
                    {
                        dimension: "Keyword",
                        parameters: [
                            {
                                name: "SearchKey",
                                value: "restaurant+in+chicago"
                            }
                        ]
                    },
                    {
                        dimension: "Transport",
                        value: "WithCar"
                    }
                ],
                support: [
                    {
                        category: "Transport"
                    }
                ]
            }
        )
        {
            data {
                title
                address
                latitude
                longitude
            }
            support {
                category
                service
                url
            }
        }
    }
`;

/**
 * Cinema sample context
 */
let cinemaContext = `
    query Cinema {
        executeQuery(
            context: {
                _id: "566d8aa73450c916059a5141",
                context: [
                    {
                        dimension: "InterestTopic",
                        value: "Cinema"
                    },
                    {
                        dimension: "Location",
                        parameters: [
                            {
                                name: "CityName",
                                value: "Milan"
                            }
                        ]
                    },
                    {
                        dimension: "Transport",
                        value: "WithCar"
                    }
                ],
                support: [
                    {
                        category: "Transport"
                    }
                ]
            }
        )
        {
            data {
                title
                address
                telephone
                latitude
                longitude
            }
            support {
                category
                service
                url
            }
        }
    }
`;

/**
 * Hotel sample context
 */
let hotelContext = `
    query Hotel {
        executeQuery(
            context: {
                _id: "566d8aa73450c916059a5141",
                context: [
                    {
                        dimension: "InterestTopic",
                        value: "Hotel"
                    },
                    {
                        dimension: "Location",
                        parameters: [
                            {
                                name: "CityName",
                                value: "Milan"
                            }
                        ]
                    },
                    {
                        dimension: "Tipology",
                        value: "Taxi"
                    }
                ],
                support: [
                    {
                        category: "Transport"
                    }
                ]
            }
        )
        {
            data {
                title
                address
                telephone
                city
                website
                email
                latitude
                longitude
            }
            support {
                category
                service
                url
            }
        }
    }
`;

/**
 * Museum sample context
 */
let museumContext = `
    query Museum {
        executeQuery(
            context: {
                _id: "566d8aa73450c916059a5141",
                context: [
                    {
                        dimension: "InterestTopic",
                        value: "Museum"
                    },
                    {
                        dimension: "Location",
                        parameters: [
                            {
                                name: "CityName",
                                value: "Milan"
                            }
                        ]
                    },
                    {
                        dimension: "Tipology",
                        value: "CarSharing"
                    }
                ],
                support: [
                    {
                        category: "Transport"
                    }
                ]
            }
        )
        {
            data {
                title
                address
                city
                website
                email
                latitude
                longitude
            }
            support {
                category
                service
                url
            }
        }
    }
`;

/**
 * Theater sample context
 */
let theaterContext = `
    query Theater {
        executeQuery(
            context: {
                _id: "566d8aa73450c916059a5141",
                context: [
                    {
                        dimension: "InterestTopic",
                        value: "Theater"
                    },
                    {
                        dimension: "Location",
                        parameters: [
                            {
                                name: "CityCoord",
                                fields: [
                                    {
                                        name: "Latitude",
                                        value: "45.478869"
                                    },
                                    {
                                        name: "Longitude",
                                        value: "9.234337"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        dimension: "Tipology",
                        value: "WithDriver"
                    }
                ],
                support: [
                    {
                        category: "Transport"
                    }
                ]
            }
        )
        {
            data {
                title
                address
                telephone
                website
                latitude
                longitude
            }
            support {
                category
                service
                url
            }
        }
    }
`;