const Cart = require('../models/cartModel');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');

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
      .populate('items.book')
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
