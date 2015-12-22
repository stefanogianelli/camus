/**
 * Restaurant sample context
 */
let restaurantContext = `
    query Restaurant {
        executeQuery (
            _id: "566eec3f21e45748095f1aae",
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
        )
        {
            primaryResults {
                edges {
                    node {
                        title
                        address
                        latitude
                        longitude
                    }
                }
            }
            supportResults {
                edges {
                    node {
                        category
                        service
                        url
                    }
                }
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
            _id: "566eec3f21e45748095f1aae",
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
        )
        {
            primaryResults {
                edges {
                    node {
                        title
                        address
                        telephone
                        latitude
                        longitude
                    }
                }
            }
            supportResults {
                edges {
                    node {
                        category
                        service
                        url
                    }
                }
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
            _id: "566eec3f21e45748095f1aae",
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
        )
        {
            primaryResults {
                edges {
                    node {
                        title
                        address
                        telephone
                        city
                        website
                        email
                        latitude
                        longitude
                    }
                }
            }
            supportResults {
                edges {
                    node {
                        category
                        service
                        url
                    }
                }
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
            _id: "566eec3f21e45748095f1aae",
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
        )
        {
            primaryResults {
                edges {
                    node {
                        title
                        address
                        city
                        website
                        email
                        latitude
                        longitude
                    }
                }
            }
            supportResults {
                edges {
                    node {
                        category
                        service
                        url
                    }
                }
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
            _id: "566eec3f21e45748095f1aae",
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
        )
        {
            primaryResults {
                edges {
                    node {
                        title
                        address
                        telephone
                        website
                        latitude
                        longitude
                    }
                }
            }
            supportResults {
                edges {
                    node {
                        category
                        service
                        url
                    }
                }
            }
        }
    }
`;