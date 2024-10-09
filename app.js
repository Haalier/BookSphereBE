const express = require('express');
const morgan = require('morgan');
const bookRoute = require('./routes/bookRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Logs for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Routes
app.use('/api/v1/books', bookRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

// Middleware for handling errors
app.use(globalErrorHandler);

module.exports = app;
