require('express-async-errors');

const logger = require('debug')('champ:app');
const express = require('express');
const hbs = require('express-handlebars');
const Sentry = require('@sentry/node');

const helpers = require('../views/helpers');
const gothamist = require('../routes/gothamist');

const engine = hbs({
  extname: 'hbs',
  helpers,
});
const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'dev',
});

// express error handlers require an arity of 4
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) {
    logger(err);
  }
  res.status(err.statusCode || 500);
  res.render('error', {layout: false});
}

app.engine('hbs', engine);

app.set('view engine', 'hbs');

app.use(Sentry.Handlers.requestHandler());
app.use('/gothamist', gothamist);

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

module.exports = app;
