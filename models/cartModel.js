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
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total price cannot be negative.'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.pre('save', async function (next) {
  try {
    await this.populate('items.book');

    this.total = this.items.reduce((accumulator, item) => {
      return accumulator + item.book.price * item.quantity;
    }, 0);
    next();
  } catch (err) {
    next(err);
  }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
