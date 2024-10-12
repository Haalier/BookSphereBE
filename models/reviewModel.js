const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      minLength: [5, 'Review must have at least 5 characters.'],
      maxLength: [250, 'Review max length is 250 characters.'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must have rating.'],
      min: 1,
      max: 5,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: [true, 'Review must belong to a book.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
