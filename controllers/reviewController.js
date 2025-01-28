const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

exports.getReviews = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    let reviews;
    if (bookId) {
      reviews = await Review.find({ book: bookId }).populate('user').exec();
    } else {
      reviews = await Review.find().populate('user').exec();
    }

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ user: userId })
      .populate('book', 'author title')
      .exec();

    res.status(200).json({
      status: 'success',
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId).populate('user').exec();

    if (!review) {
      return next(new AppError("Can't find review with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    if (req.params.bookId) req.body.book = req.params.bookId;
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    let updatedReview;
    const { reviewId } = req.params;
    const { id: userId } = req.user;

    if (
      !mongoose.Types.ObjectId.isValid(reviewId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return next(new AppError('Invalid ID format.', 400));
    }

    updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { review: req.body.review, rating: req.body.rating },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedReview) {
      return next(new AppError("Can't find review with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      reviewData: updatedReview,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    let deletedReview;
    if (req.user.role === 'user') {
      const { id } = req.user;
      deletedReview = await Review.findOneAndDelete({
        _id: reviewId,
        user: id,
      }).exec();
    } else if (req.user.role === 'admin') {
      deletedReview = await Review.findByIdAndDelete(reviewId).exec();
    }

    if (!deletedReview) {
      return next(new AppError("Can't find review with this ID.", 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
