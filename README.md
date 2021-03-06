# CHAMP
### Convert HTML A M P
_need we say more?_

## Getting Started

```sh
$ git clone git@github.com:nypublicradio/champ
$ cd champ
$ npm i
$ npm start
```

### Development

This package comes with `debug` as a dependency to assist with logging during development. Setup a new logger by following the directions in the [debug repo](https://github.com/visionmedia/debug). Please namespace any new loggers with `champ:`.

`$ npm start` will turn on all the loggers in the `champ:` namespace by default. Use `$ npm run debug` to see more verbose output (e.g. from express itself).

When `NODE_ENV` is set, the application-level loggers will be disabled. **NOTE** that any library loggers will still be turned on, i.e. `$ NODE_ENV=prod npm run debug` will still display output from the express loggers.

## Application Layout

Express looks for templates in the `views` directory by default.

Each site implementing a set of AMP templates should add a new folder to `views` and a new route to `routes` to handle fetching, data management, and rendering the template.

## Notes on Deployment

`NODE_ENV` must be set to `production` in order for the app to run in production mode. Note that this value is also passed to sentry for categorizing uncaught exceptions, so set it to `demo` in the demo infra.

## Configuration

### Legend

| **Symbol**     | **Translation**                            |
| -------------- | ------------------------------------------ |
| :white_circle: | Not required.                              |
| :black_circle: | Required in "live" (prod & demo)           |
| :red_circle:   | Required in "live", local, and test envs   |

**NOTE** test values are retrieved from `.env.sample`.

### Values

| **Required?**  | **Config Value** | **Description**                                  |
| -------------- | ---------------- | ------------------------------------------------ |
| :red_circle:   | `GOTHAMIST_HOST` | Protocol and host to gothamist fastboot backend. |
| :black_circle: | `NODE_ENV`       | Acceptable values are "prod", "demo", or "dev".  |
| :white_circle: | `PORT`           | Port number on which to run server.              |
| :black_circle: | `SENTRY_DSN`     | DSN value for error reporting to sentry.         |
