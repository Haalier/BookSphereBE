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

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required.'],
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative.'],
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative.'],
  },
});

cartSchema.pre('save', async function (next) {
  try {
    await this.populate('items.book', 'title price');

    this.total = this.items.reduce((accumulator, item) => {
      return (
        Math.round((accumulator + item.book.price * item.quantity) * 100) / 100
      );
    }, 0);

    this.totalItems = this.items.reduce(
      (accumulator, item) => accumulator + item.quantity,
      0
    );

    next();
  } catch (err) {
    next(err);
  }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
