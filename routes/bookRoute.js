const express = require('express');
const bookController = require('../controllers/bookController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:bookId/reviews/', reviewRouter);

router.route('/').get(bookController.getBooks).post(bookController.createBook);
router
  .route('/:bookId')
  .get(bookController.getBook)
  .patch(bookController.updateBook);

module.exports = router;
