class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // Excluding parameters to ensure they don't interfere with the filtering logic
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log('QUERY OBJ: ', queryObj);

    for (let [key, value] of Object.entries(queryObj)) {
      if (!value) {
        delete queryObj[key];
      } else if (key === 'category') {
        queryObj[key] = { $in: value.split(',') };
      }
    }

    let queryStr = JSON.stringify(queryObj);
    // Regular expression to replace keywords with mongoDB operators like $lte
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log('QUERY:', queryStr);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      const allowedSortFields = ['price', 'rating', 'author', 'category'];
      const sortFields = sortBy.split(' ');

      const isValid = sortFields.every((field) => {
        const cleanField = field.replace('-', '');
        return allowedSortFields.includes(cleanField);
      });

      if (isValid) {
        this.query = this.query.sort(sortBy);
      } else {
        throw new Error('Invalid sort field(s)');
      }
    } else {
      this.query = this.query.sort('-createdAt _id');
    }
    return this;
  }

  limitFields() {
    const sensitiveFields = ['password', 'ssn', 'secret'];
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .filter((field) => !sensitiveFields.includes(field.trim()))
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
