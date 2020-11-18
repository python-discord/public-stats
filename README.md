# Python Discord public statistics

Public statistics for the Discord server available at https://stats.pydis.com

## Running locally with docker-compose
If you're running this locally, the easiest way is to just use `docker-compose`. We've provided a `docker-compose` file that will first start up Graphite, and then build and launch the app.

In order to get the app running, all you need to do is:
```shell script
docker-compose up
``` 

## Setting up for production

### Graphite
The app expects Graphite to be accessible at the location set in the `GRAPHITE_HOST` environment variable.

### React
The debug react server can be started with `yarn start`. By default it will proxy requests it does not understand to port 5000 where Flask is running.

### Flask
The flask backend can be started with `python -m api`.

### Building
To build the HTML files for production use `npm install && yarn build`.

**You must build the HTML before the Docker image, the HTML must be inside the Docker image so Flask can serve it.**

By default, the app expects to find the HTML inside `/app/build/*`
