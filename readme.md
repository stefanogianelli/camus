[![Build Status](https://travis-ci.com/stefanogianelli/camus.svg?token=efsduJeDxrmWMeSyeDHM&branch=master)](https://travis-ci.com/stefanogianelli/camus)

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

For tests running install globally the module [PM2](https://github.com/Unitech/pm2):

    npm install pm2 -g

Running
=======

Make sure that a mongodb and redis daemon instances are running. Then:

    npm start


Docker
======

It's possible to execute the application on a [Docker](https://www.docker.com/) container. Make sure to install also [Docker Compose](https://www.docker.com/products/docker-compose).
First build the container with the command:

    docker-compose build

Then run the container:

    docker-compose up

To get the docker machine's ip address execute the command:

    docker-machine ls
    
Note: get only the ip address becuase the mapped port for CAMUS remain 3001.

For the first run assure to create the entries in the database using the /createDatabase endpoint

Note for MAC OS X users: if you get the error message:

    Couldn't connect to Docker daemon - you might need to run `docker-machine start default`.
    
execute first:

    eval "$(docker-machine env default)"

Test
====

Make sure that a mongodb and redis daemon instances are running.

Running the test cases with command:

    npm test

or to produce a coverage report execute:

    npm run cover

The report will be created in the folder called 'coverage' inside the project's root folder.

Endpoints
=========

By default the server's address is [http://localhost:3001](http://localhost:3001)

The available endpoints are:
* **GET /createDatabase**: it first destroys the existing database, then create from scratch a new one with the default data
* **GET /graphql**: graphiql interface for making queries in GraphQL style. Documentation about allowed input and output fields is available in the "Docs" section, on top-right corner of the page
