const express = require('express');
const morgan = require('morgan');
const bookRoute = require('./routes/bookRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/books', bookRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
