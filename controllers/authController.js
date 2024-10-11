const User = require('../models/userModel');
const AppError = require('../utils/appError');

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError('Please enter a valid email address or password.')
    );
  }
};
