const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({
      user: userId,
    }).exec();

    res.status(200).json({
      status: 'success',
      results: orders.length,
      user: req.user.id,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await Order.findOne({ user: userId, id: req.params.orderId });
    if (!order) {
      return next(new AppError("Can't find order with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.checkoutCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title author photoUrl price')
      .exec();

    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    const order = await Order.create({
      user: userId,
      items: cart.items.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.book.price,
        title: item.book.title,
        author: item.book.author,
        photoUrl: item.book.photoUrl,
      })),
      total: cart.total,
    });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

exports.buyNow = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return next(new AppError('Book not found.', 400));
    }

    const order = await Order.create({
      user: userId,
      items: [{ book: bookId, quantity: quantity, price: book.price }],
      total: book.price * quantity,
    });

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
