const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.getBooks = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(Book.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await apiFeatures.query.exec();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        books: doc,
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
