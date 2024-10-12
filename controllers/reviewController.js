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
  } catch (err) {
    next(err);
  }
};

exports.updateReviewIfOwner = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;

    const updatedReview = await Review.findOneAndUpdate({
      _id: reviewId,
      user: { _id: userId },
    });

    if (!updatedReview) {
      return next(new AppError('Invalid review ID / Forbidden.', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review: updatedReview,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const reviewDelete = await Review.findByIdAndDelete(reviewId).exec();

    if (!reviewDelete) {
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

exports.deleteReviewIfOwner = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;

    const deleteReview = await Review.findOneAndDelete({
      _id: reviewId,
      user: { _id: userId },
    }).exec();

    if (!deleteReview) {
      return next(new AppError('Invalid review ID / Forbidden', 403));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
