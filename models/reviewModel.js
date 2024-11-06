const mongoose = require('mongoose');
const Book = require('../models/bookModel');
const reviewSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Review must belong to a book.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Preventing duplicate reviews
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
// Middleware to calculate ratings on book everytime review is saved or created
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.book);
});
// Middleware to calculate ratings on book everytime review is updated
// works with 'findByIdAnd...' because behind the scenes it is same method as 'findOneAnd...'
// in POST middleware we get 'docs' parameter which is executed document.
reviewSchema.post(/^findOneAnd/, async function (docs) {
  await docs.constructor.calcAverageRatings(docs.book);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
