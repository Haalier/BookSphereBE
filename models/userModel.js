const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User should have a name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'User should have an email!'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide correct email address!'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'The user role should be either user or admin',
    },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    trim: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    trim: true,
    validate: {
      validator: function (v) {
        return v === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew()) return next();

  this.passwordChangedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
