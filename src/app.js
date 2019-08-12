require('express-async-errors');

const express = require('express');
const hbs = require('express-handlebars');
const Sentry = require('@sentry/node');

const gothamist = require('../routes/gothamist');


const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'dev',
});

// express error handlers require an arity of 4
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.render('error', {layout: false});
}

app.engine('hbs', hbs());
app.set('view engine', 'hbs');

app.use(Sentry.Handlers.requestHandler());
app.use('/gothamist', gothamist);

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

module.exports = app;
