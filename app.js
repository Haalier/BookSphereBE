const express = require('express');
const morgan = require('morgan');
const bookRoute = require('./routes/bookRoute');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/books', bookRoute);
module.exports = app;
