const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', reviewController.getReviews);
router.get('/:reviewId', reviewController.getReview);
