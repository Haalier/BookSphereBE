const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.route('/').get(bookController.getBooks).post(bookController.createBook);
router.get('/:bookId', bookController.getBook);
router.patch('/:bookId', bookController.updateBook);
module.exports = router;
