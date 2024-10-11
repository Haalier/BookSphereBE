const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/signup', authController.signUp);
router.get('/login', authController.login);
router.get('/', userController.getUsers);

module.exports = router;
