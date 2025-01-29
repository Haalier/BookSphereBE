const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const bookRoute = require('./routes/bookRoute');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');
const myReviewsRoute = require('./routes/myReviewsRoute');
const cartRoute = require('./routes/cartRoute');
const orderRoute = require('./routes/orderRoute');
const searchRoute = require('./routes/searchRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.enable('trust proxy');
// Logs for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(cors());

app.use(express.json());
app.use(
  '/public/images/books',
  express.static(path.join(__dirname, 'public/images/books'))
);

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  console.log(req.headers);
  next();
});

// Routes
app.use('/api/v1/books', bookRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/my-reviews', myReviewsRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/search', searchRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

// Middleware for handling errors
app.use(globalErrorHandler);

module.exports = app;
