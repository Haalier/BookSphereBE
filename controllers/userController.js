const User = require('../models/userModel');
const AppError = require('../utils/appError');

// Function to filter allowed fields that are able to be updated by user
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return next(new AppError("Can't find user with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMe = (req, res, next) => {
  req.params.userId = req.user._id;
  next();
};

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password updates.'));
    }
    // Filtering req.body object for allowed fields
    const filteredBody = filterObj(req.body, 'name', 'password');

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      next(new AppError("Can't find user with this ID.", 404));
    }

    res.status(200).json({
      status: 'success',
      user: user,
    });
  } catch (err) {
    next(err);
  }
};
