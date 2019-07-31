require('dotenv').config();

const express = require('express');
const hbs = require('express-handlebars');

const gothamist = require('./routes/gothamist');

const app = express();

const errorHandler = (err, req, res, next) => {
  res.status(500);
  res.render('error', {layout: false});
}

app.engine('hbs', hbs());
app.set('view engine', 'hbs');

app.use('/gothamist', gothamist);

app.use(errorHandler);

app.listen(8000, () => console.log('listening'));