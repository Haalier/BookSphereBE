const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// router.post('/');
router.get('/', bookController.getBooks);

module.exports = router;
