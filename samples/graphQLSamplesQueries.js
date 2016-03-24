/**
 * LOGIN ENDPOINT
 */

const loginQuery = `{
  login (mail: "COPY_MAIL_HERE", password: "COPY_PASSWORD_HERE") {
    name
    surname
    token
  }
}`


/**
 * PERSONAL DATA ENDPOINT
 */

const getPersonalData = `{
  getPersonalData(mail: "COPY_MAIL_HERE", token: "COPY_TOKEN_HERE") {
    cdt {
      idCdt
      context {
        name
        values
        parameters {
          name
          type
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
    mashup {
      list {
        topics
        contents {
          type
          style
          contents
        }
      }
      details {
        topics
        contents {
          type
          style
          contents
        }
      }
    }
  }
}`


/**
 * EXECUTE QUERY ENDPOINT
 */

// Restaurant sample context
const restaurantContext = `query Restaurant {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`

// Cinema sample context
const cinemaContext = `query Cinema {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`

//Hotel sample context
const hotelContext = `query Hotel {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`

// Museum sample context
const museumContext = `query Museum {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`

// Theater sample context
const theaterContext = `query Theater {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`

// Event sample context
const eventContext = `query Event {
    executeQuery (
        userMail: "COPY_MAIL_HERE",
        idCdt: "COPY_ID_HERE",
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
            },
            {
                dimension: "OS",
                value: "iOS"
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
                storeLink
            }
        }
    }
}`