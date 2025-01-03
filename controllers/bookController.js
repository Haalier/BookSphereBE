const multer = require('multer');
const Book = require('../models/bookModel');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
const meiliSearch = require('../utils/meiliSearch');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/books');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `book-${req.user.id}${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadBookPhoto = upload.single('photo');

exports.getBooks = async (req, res, next) => {
  try {
    const countFeatures = new ApiFeatures(Book.find(), req.query).filter();

    const totalFiltered = await countFeatures.query.countDocuments();

    const apiFeatures = new ApiFeatures(Book.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await apiFeatures.query.exec();

    res.status(200).json({
      status: 'success',
      results: totalFiltered,
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

exports.getBookByIdSlug = async (req, res, next) => {
  try {
    const book = await Book.find({
      _id: req.params.bookId,
      slug: req.params.slug,
    });

    if (!book) {
      return next(new AppError("Can't find book with this ID/slug.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        book: book[0],
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.createBook = async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  try {
    const book = await Book.create(req.body);
    book.photoUrl = `${req.protocol}//${req.get('host')}/public/images/books/${book.photo}`;

    if (book) {
      await meiliSearch.addBookToSearch(book._id);
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
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      { ...req.body, photo: req.file ? req.file.filename : undefined },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!book) {
      return next(new AppError("Can't find book with this ID.", 404));
    }
    book.photoUrl = `${req.protocol}://${req.get('host')}/public/images/books/${book.photo}`;
    await meiliSearch.updateBookToSearch(book._id);
    await book.save();
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

exports.deleteBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    await Book.findByIdAndDelete(bookId);
    await meiliSearch.deleteBookToSearch(bookId);

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
