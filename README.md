# Python Discord public statistics

Public statistics for the Discord server available at https://stats.pydis.com.

## Setup

### Graphite

Graphite must be accessible at the location set in `GRAPHITE_HOST`..

### React

The debug react server can be started with `yarn start`. By default it will proxy requests it does not understand to port 5000 where Flask is running.

### Flask

The flask backend can be started with `python -m api`.

### Building

To build the HTML files for production use `yarn build`.
