# Snueue

[Snueue](https://www.snueue.audio/) is an application that makes playing music and videos from reddit awesome.

## Installation 

The reccomended method for installing and running Snueue for development is using [Docker Compose](https://docs.docker.com/compose/). This is automatically install all of the dependencies for Snueue along with a Redis database in docker containers.

Just follow the [instructions](https://docs.docker.com/compose/install/) to install Docker and Docker Compose on your system and run `docker-compose up`. The application will be available at [localhost:5000](http://localhost:5000).

The automated build for Snueue is [available on DockerHub](https://registry.hub.docker.com/u/renfredxh/snueue/)

## Testing
[![Build Status](https://travis-ci.org/renfredxh/snueue.svg)](https://travis-ci.org/renfredxh/snueue)

To run the tests with docker-compose:

```
docker-compose run web script/test
```

🐰