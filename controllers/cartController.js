const Cart = require('../models/cartModel');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const req = require('express/lib/request');

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId).exec();
    if (!book) {
      return next(new AppError('Book not found.', 404));
    }

    let cart = await Cart.findOne({ user: userId }).exec();

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ book: bookId, quantity: quantity || 1 }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.book.toString() === bookId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity || 1;
      } else {
        cart.items.push({ book: bookId, quantity: quantity || 1 });
      }

      await cart.save();
    }
    const totalItems = cart.items.reduce((acc, item) => {
      return (acc += item.quantity);
    }, 0);
    res.status(200).json({
      status: 'success',
      totalItems,
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate('items.book', '-stock -priceDiscount -slug -pages -description')
      .select('-__v')
      .exec();

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: { items: [] },
        },
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).exec();
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }
    // Using this instead of findByIdAndDelete to run pre save middleware
    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    await cart.save();

    await cart.populate('items.book');

    res.stauts(204).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return next(new AppError('Quantity must be at least 1.', 400));
    }

    const cart = await Cart.findOne({ user: userId }).exec();
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    const item = cart.items.find((item) => item.book.toString() === bookId);

    if (!item) {
      return next(new AppError('Book in cart not found.', 404));
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate('items.book');

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};
