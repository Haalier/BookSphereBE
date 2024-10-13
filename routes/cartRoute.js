const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router
  .route('/:bookId')
  .patch(cartController.updateCartItem)
  .delete(cartController.removeFromCart);
module.exports = router;
