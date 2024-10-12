const User = require('../models/userModel');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    console.log(token);

    user.password = undefined;
    res.setHeaders(headers);
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError('Please enter a valid email address or password.')
    );
  }
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log('TOKEN: ' + token);
  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get the access.',
        401
      )
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  const freshUser = await User.findOne({ _id: decoded.id });
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.'),
      401
    );
  }
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.')
    );
  }
  req.user = freshUser;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError("You don't have permission to perform this action"));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError(
          'There is no user with that email address. Please try again.'
        )
      );
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.USER_MAIL_PASSWORD,
      },
    });

    let MailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'BookSphere',
        link: 'https://booksphere.io/',
      },
    });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    let response = {
      body: {
        name: 'there',
        intro: 'Reset Password',
        action: {
          instructions:
            'To reset your password, please click the button below:',
          button: {
            color: '#22BC66',
            text: 'Reset your password',
            link: resetUrl,
          },
        },
        outro: 'This mail was generated automatically. Do not respond.',
      },
    };

    let mail = MailGenerator.generate(response);

    let message = {
      from: process.env.USER_MAIL,
      to: req.body.email,
      subject: 'Reset Password',
      html: mail,
    };

    await transporter.sendMail(message);

    res.status(200).json({
      status: 'success',
      message: 'You should receive an email.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    console.log('Token from URL: ' + req.params.resetToken);

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    console.log('Hashed token: ' + hashedToken);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })
      .select('+password')
      .exec();

    console.log(user);

    if (!user) {
      return next(new AppError('Link is invalid or has expired.'));
    }

    if (await user.correctPassword(req.body.password, user.password)) {
      return next(
        new AppError(
          'New password must be different from the previous password!',
          400
        )
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Have to use save() method to run all document middlewares in schema with pre save
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};
