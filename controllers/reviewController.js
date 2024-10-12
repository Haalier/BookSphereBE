const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().exec();

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId).exec();

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
  const { reviewId } = req.params;

  const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
    runValidators: true,
  }).exec();

  if (!updatedReview) {
    return next(new AppError("Can't find review with this ID.", 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
};

exports.deleteReview = async (req, res, next) => {
  const { reviewId } = req.params;

  const reviewDelete = await Review.findByIdAndDelete(reviewId).exec();

  if (!reviewDelete) {
    return next(new AppError("Can't find review with this ID.", 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
