const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity of books is required.'],
    min: [1, 'Quantity of books should be at least 1.'],
    default: 1,
  },
  title: {
    type: String,
    required: [true, 'Book must have a title.'],
  },
  author: {
    type: String,
    required: [true, 'Book must have an author.'],
  },
  photoUrl: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  slug: String,
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required.'],
    select: false,
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative.'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending',
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
