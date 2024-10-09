const Book = require('../models/bookModel');

exports.getBooks = async (req, res, next) => {
  try {
    const books = await Book.find().exec();

    res.status(200).json({
      status: 'success',
      data: {
        books,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.createBook = async (req, res, next) => {
  const book = await Book.create(req.body);
};
