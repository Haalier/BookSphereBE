const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);

// Protects all routes after this middleware

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);

// Routes below this middleware are available only for admins
router.use(authController.restrictTo('admin'));

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUser);
module.exports = router;
