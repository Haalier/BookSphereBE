const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
exports.getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().exec();

    if (!books.length > 0) {
      return next(new AppError('Not Found', 404));
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

// exports.createBook = async (req, res, next) => {
//   try {
//   } catch (err) {}
//   const book = await Book.create(req.body);
// };
