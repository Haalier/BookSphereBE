const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);
router.get('/:reviewId', reviewController.getReview);

router
  .route('/:reviewId')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user'), reviewController.updateReview)
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
