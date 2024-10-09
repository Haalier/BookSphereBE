const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    title: {
      type: string,
      required: [true, 'Book title is required!'],
      trim: true,
    },
    author: {
      type: string,
      required: [true, 'Author is required!'],
      trim: true,
    },
    pages: {
      type: Number,
      required: [true, 'a book must have pages count!'],
    },
    category: {
      type: string,
      required: [true, 'a book category is required!'],
    },
    description: {
      type: string,
      required: [true, 'a book description is required!'],
    },

    imageCover: {
      type: string,
      required: [true, 'a book must have image cover!'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0!'],
      max: [5, 'Ratings must be below 5.0!'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a book price is required!'],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  }
);
