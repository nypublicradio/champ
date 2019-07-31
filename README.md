# CHAMP
### Convert HTML A M P
_need we say more?_

## Getting Started

```sh
$ git clone git@github.com:nypublicradio/champ
$ cd champ
$ npm i
$ node index
```

## Application Layout

Express looks for templates in the `views` directory by default.

Each site implementing a set of AMP templates should add a new folder to `views` and a new route to `routes` to handle fetching, data managment, and rendering the template.

## Notes on Deployment

`NODE_ENV` must be set to `production` in order for the app to run in production mode.