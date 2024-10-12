const express = require('express');
const bookController = require('../controllers/bookController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:bookId/reviews/', reviewRouter);

router.route('/').get(bookController.getBooks).post(bookController.createBook);
router.get('/:bookId', bookController.getBook);
router.patch('/:bookId', bookController.updateBook);
module.exports = router;
