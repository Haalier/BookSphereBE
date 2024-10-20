const express = require('express');
const bookController = require('../controllers/bookController');
const AuthController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:bookId/reviews/', reviewRouter);

router
  .route('/')
  .get(bookController.getBooks)
  .post(
    AuthController.protect,
    AuthController.restrictTo('admin'),
    bookController.uploadBookPhoto,
    bookController.createBook
  );
router
  .route('/:bookId')
  .get(bookController.getBook)
  .patch(
    AuthController.protect,
    AuthController.restrictTo('admin'),
    bookController.uploadBookPhoto,
    bookController.updateBook
  );

router.get('/:bookId/:slug', bookController.getBookByIdSlug);

module.exports = router;
