const Cart = require('../models/cartModel');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

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

    res.status(200).json({
      status: 'success',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate(
        'items.book',
        '-stock -priceDiscount -slug -pages -description -ratingsAverage -ratingsQuantity -__v -createdAt -updatedAt' +
          ' -category'
      )
      .select('-__v -_id')
      .exec();

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: { items: [] },
      });
    }

    res.status(200).json({
      status: 'success',
      data: cart,
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
    cart.items = cart.items.filter((item) => {
      return item.book.toString() !== bookId;
    });

    await cart.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCartItemCount = async (req, res, next) => {
  try {
    const count = await Cart.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, totalItems: { $sum: '$items.quantity' } } },
    ]);

    const totalItems = count[0]?.totalItems || 0;

    res.status(200).json({
      status: 'success',
      totalItems,
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
