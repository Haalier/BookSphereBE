const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: {
    type: string,
    required: [true, 'Book title is required!'],
    trim: true,
  },
});
