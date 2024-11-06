const { MeiliSearch } = require('meilisearch');
const Book = require('../models/bookModel');

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
  apiKey: 'aSampleMasterKey',
});
const index = client.index('books');

const setPrimaryKey = async () => {
  try {
    await index.update({ primaryKey: '_id' });
  } catch (err) {
    console.log(err);
  }
};

exports.addBookToSearch = (bookId) => {
  return async (req, res, next) => {
    try {
      await setPrimaryKey();
      const book = await Book.findById(bookId).exec();
      const bookToSearch = book.map((book) => ({
        _id: book._id,
        title: book.title,
        author: book.author,
        category: book.category,
      }));

      await index.addDocuments(bookToSearch, {
        primaryKey: '_id',
      });
    } catch (err) {
      next(err);
    }
  };
};

exports.updateBookToSearch = (bookId) => {
  return async (req, res, next) => {
    try {
      await setPrimaryKey();
      await index.updateDocuments(bookId, { primaryKey: '_id' });
    } catch (err) {
      next(err);
    }
  };
};

exports.deleteBookToSearch = (bookId) => {
  return async (req, res, next) => {
    try {
      await index.deleteDocument(bookId);
    } catch (err) {
      next(err);
    }
  };
};
exports.searchBooks = async (req, res, next) => {
  try {
    let data;
    console.log('QUERY', req.query);
    const query = req.query.q || '';
    const search = await index.search(query);
    console.log(search.hits.length);
    console.log(search.hits);
    const ids = search.hits.map((hit) => hit._id);
    data = await Book.find({ _id: { $in: ids } }).exec();

    res.status(200).json({
      status: 'success',
      results: search.hits.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};
