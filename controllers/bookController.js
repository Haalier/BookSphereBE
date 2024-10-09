const Book = require('../models/bookModel');
const AppError = require('../utils/appError');

exports.getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().exec();
    if (!books.length > 0) {
      return next(new AppError('There is no books', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        books,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return next(new AppError("Can't find book with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    if (!book) {
      return next(
        new AppError("Something went wrong. Can't add this book."),
        404
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.bookId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return next(new AppError("Can't find book with this ID.", 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (err) {
    return next(err);
  }
};
