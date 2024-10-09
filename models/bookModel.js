const mongoose = require('mongoose');
const slugify = require('slugify');

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A book title is required!'],
      trim: true,
      minLength: [1, 'A book title must have more or equal than 1 character!'],
      maxLength: [
        100,
        'A book title must have less or equal than 100 characters!',
      ],
    },
    author: {
      type: String,
      required: [true, 'Author is required!'],
      trim: true,
      maxLength: [
        50,
        'Author name must have less or equal than 50 characters!',
      ],
    },
    pages: {
      type: Number,
      required: [true, 'A book must have pages count!'],
      min: [1, 'A book must have at least 1 page!'],
    },
    category: {
      type: String,
      required: [true, 'A book category is required!'],
      trim: true,
      enum: {
        values: [
          'Fantasy',
          'Sci-Fi',
          'Dystopian',
          'Adventure',
          'Romance',
          'Mystery',
          'Horror',
          'Thriller & Suspense',
          'Historical Fiction',
          'Romance',
          'Contemporary Fiction',
          'Literary Fiction',
          'Magical Realism',
          'Biography',
          'Food & Drink',
          'History',
          'Travel',
          'True Crime',
          'Science & Technology',
          'Business and economics',
          'Health and fitness',
          'Humor',
          'Philosophy',
          'Fairytale',
          'Satire',
          'Western',
        ],
        message: 'There is no such category!',
      },
    },
    description: {
      type: String,
      required: [true, 'A book description is required!'],
    },

    imageCover: {
      type: String,
      required: [true, 'A book must have image cover!'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0!'],
      max: [5, 'Ratings must be below 5.0!'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A book price is required!'],
      min: [1, 'Price must be above 1!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below actual price',
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative!'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  }
);

bookSchema.virtual('priceAfterDiscount').get(function () {
  if (this.priceDiscount) {
    return this.price - this.priceDiscount;
  }
  return this.price;
});

bookSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
