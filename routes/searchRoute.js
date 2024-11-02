const express = require('express');
const meiliSearch = require('../utils/meiliSearch');
const router = express.Router();

router.get('/', meiliSearch.searchBooks);

module.exports = router;
