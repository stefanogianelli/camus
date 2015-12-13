/*
Restaurant sample context
 */
var restaurantContext = `
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