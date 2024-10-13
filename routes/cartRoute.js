const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
// router.route('/');

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);

module.exports = router;
