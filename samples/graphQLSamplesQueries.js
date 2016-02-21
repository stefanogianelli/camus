/**
 * LOGIN ENDPOINT
 */

const loginQuery = `{
  login (mail: "COPY_MAIL_HERE", password: "COPY_PASSWORD_HERE") {
    id
    name
    surname
    token
  }
}`


/**
 * PERSONAL DATA ENDPOINT
 */

const getPersonalData = `{
  getPersonalData(id: "COPY_ID_HERE", token: "COPY_TOKEN_HERE") {
    idCdt
    context {
      name
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
    defaultValues {
      dimension
      value
    }
  }
}`


/**
 * EXECUTE QUERY ENDPOINT
 */

// Restaurant sample context
const restaurantContext = `query Restaurant {
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
                        name: "CityCoord",
                        fields: [
                          {
                            name: "Latitude",
                            value: "45.4788807"
                          },
                          {
                            name: "Longitude",
                            value: "9.2321363"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`

// Cinema sample context
const cinemaContext = `query Cinema {
    executeQuery (
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
                        name: "CityCoord",
                        fields: [
                          {
                            name: "Latitude",
                            value: "45.4788807"
                          },
                          {
                            name: "Longitude",
                            value: "9.2321363"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`

//Hotel sample context
const hotelContext = `query Hotel {
    executeQuery (
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
                        name: "CityCoord",
                        fields: [
                          {
                            name: "Latitude",
                            value: "45.4788807"
                          },
                          {
                            name: "Longitude",
                            value: "9.2321363"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`

// Museum sample context
const museumContext = `query Museum {
    executeQuery (
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
                        name: "CityCoord",
                        fields: [
                          {
                            name: "Latitude",
                            value: "45.4788807"
                          },
                          {
                            name: "Longitude",
                            value: "9.2321363"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`

// Theater sample context
const theaterContext = `query Theater {
    executeQuery (
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
                            value: "45.4788807"
                          },
                          {
                            name: "Longitude",
                            value: "9.2321363"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`

// Event sample context
const eventContext = `query Event {
    executeQuery (
        _id: "COPY_ID_HERE",
        context: [
            {
                dimension: "InterestTopic",
                value: "Event"
            },
            {
                dimension: "Location",
                parameters: [
                    {
                        name: "CityCoord",
                        fields: [
                          {
                            name: "Latitude",
                            value: "37.7698972"
                          },
                          {
                            name: "Longitude",
                            value: "-122.4112957"
                          }
                        ]
                    }
                ]
            },
            {
                dimension: "Transport",
                value: "PublicTransport"
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
              meta {
                name
                rank
              }
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
}`