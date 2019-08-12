const express = require('express');
const hbs = require('express-handlebars');

const gothamist = require('../routes/gothamist');


const app = express();

// express error handlers require an arity of 4
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.render('error', {layout: false});
}

app.engine('hbs', hbs());
app.set('view engine', 'hbs');

app.use('/gothamist', gothamist);

app.use(errorHandler);

module.exports = app;
