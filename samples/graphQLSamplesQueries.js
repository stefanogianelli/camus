/**
 * LOGIN ENDPOINT
 */

const loginQuery = `{
  login (mail: "COPY_MAIL_HERE", password: "COPY_PASSWORD_HERE") {
    id
    token
  }
}`


/**
 * PERSONAL DATA ENDPOINT
 */

const getPersonalData = `{
  getPersonalData(id: "COPY_ID_HERE", token: "COPY_TOKEN_HERE") {
    userId
    context {
      name
      for
      values
      parameters {
        name
        type
        enum
        fields {
          name
        }
      }
      parents
    }
  }
}`


/**
 * EXECUTE QUERY ENDPOINT
 */

// Restaurant sample context
const restaurantContext = `
    query Restaurant {
        executeQuery (
            _id: "COPY_ID_HERE",
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
            support: ["Transport"]
        )
        {
            primaryResults {
                data {
                    title
                    address
                    latitude
                    longitude
                }
            }
            supportResults {
                data {
                    category
                    service
                    url
                }
            }
        }
    }
`

// Cinema sample context
const cinemaContext = `
    query Cinema {
        executeQuery(
            _id: "COPY_ID_HERE",
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
            support: ["Transport"]
        )
        {
            primaryResults {
                data {
                    title
                    address
                    telephone
                    latitude
                    longitude
                }
            }
            supportResults {
                data {
                    category
                    service
                    url
                }
            }
        }
    }
`

//Hotel sample context
const hotelContext = `
    query Hotel {
        executeQuery(
            _id: "COPY_ID_HERE",
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
            support: ["Transport"]
        )
        {
            primaryResults {
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
            }
            supportResults {
                data {
                    category
                    service
                    url
                }
            }
        }
    }
`

// Museum sample context
const museumContext = `
    query Museum {
        executeQuery(
            _id: "COPY_ID_HERE",
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
            support: ["Transport"]
        )
        {
            primaryResults {
                data {
                    title
                    address
                    city
                    website
                    email
                    latitude
                    longitude
                }
            }
            supportResults {
                data {
                    category
                    service
                    url
                }
            }
        }
    }
`

// Theater sample context
const theaterContext = `
    query Theater {
        executeQuery(
            _id: "COPY_ID_HERE",
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
            support: [category: "Transport"]
        )
        {
            primaryResults {
                data {
                    title
                    address
                    telephone
                    website
                    latitude
                    longitude
                }
            }
            supportResults {
                data {
                    category
                    service
                    url
                }
            }
        }
    }
`