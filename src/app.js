require('express-async-errors');

const logger = require('debug')('champ:app');
const express = require('express');
const hbs = require('express-handlebars');
const Sentry = require('@sentry/node');

const helpers = require('./views/helpers');
const gothamist = require('./routes/gothamist');
const { wagtailImage } = require('./lib/wagtail');

const engine = hbs({
  extname: 'hbs',
  helpers: {
    ...helpers,
    wagtailImage,
  },
});
const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: app.get('env'),
});

if (app.get('env') === 'development' && !process.env.TEST) {
  require('./livereload')(app);
}

// express error handlers require an arity of 4
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (!err.statusCode) {
    logger(err);
  }
  res.status(err.statusCode || 500);
  res.render('error', {
    statusCode: err.statusCode,
    layout: false
  });
}

app.engine('hbs', engine);

app.set('view engine', 'hbs');
app.set('views', 'src/views')

app.use(Sentry.Handlers.requestHandler());
app.use('/champ/gothamist', gothamist);

app.use(express.static('src/static', {index: false}));

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

module.exports = app;
