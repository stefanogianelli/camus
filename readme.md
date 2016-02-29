Overview
========

TBC

Installation requirements
=========================

-   Mongodb (\^3.0.6)
-   Redis (\^3.0.6)
-   Nodejs (\^4.0.0)

Installing and running
======================

Clone the repository and execute

    npm install
    
to install the dependencies.
    
Running
=======

Make sure that a mongodb and redis daemon instances are running. Then:

    npm start

Test
====

Make sure that a mongodb and redis daemon instances are running. Then start the mock services using the command in a new command line:

    npm run services

After that, for running the test cases execute:

    npm test
    
or to produce a coverage report execute:

    npm run cover
    
The report will be created in the folder called 'coverage' inside the project's root folder.
    
Endpoints
=========

By default the server's address is [http://localhost:3001](http://localhost:3001)

The available endpoints are:
* **POST /query**: (deprecated) the principal endpoint, it allows to perform queries on the system. It takes in input a json file that represents the current context, then return the response list from the selected web service and the query addresses for support services
* **GET /createDatabase**: it first destroys the existing database, then create from scratch a new one with the default data
* **GET /graphql**: graphiql interface for making queries in GraphQL style. Documentation about allowed input and output fields is available in the "Docs" section, on top-right corner of the page
