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

exports.addBookToSearch = async (req, res, next) => {
  try {
    await setPrimaryKey();

    const books = await Book.find();
    let response = await index.addDocuments(books, { primaryKey: '_id' });

    res.status(200).json({
      status: 'success',
      data: {
        response,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.searchBooks = async (req, res, next) => {
  try {
    console.log('QUERY', req.query);
    const query = req.query.q || '';
    const search = await index.search(query);
    res.status(200).json({
      status: 'success',
      results: search.hits.length,
      data: search.hits,
    });
  } catch (err) {
    next(err);
  }
};
