const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required.'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity of books is required.'],
    min: [1, 'Quantity of books should be at least 1.'],
    default: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
