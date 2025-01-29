const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

router.use(authController.protect);

router.route('/').get(orderController.getOrders);
router.post('/checkout', orderController.checkoutCart);
router.post('/buyNow', orderController.buyNow);
router.get('/:orderId', orderController.getOrder);

module.exports = router;
