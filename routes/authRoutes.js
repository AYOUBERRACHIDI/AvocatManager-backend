const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

router.post('/register', authController.registerValidation, validate, authController.register);
router.post('/login', authController.loginValidation, validate, authController.login);
router.post('/forgot-password', authController.forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', authController.resetPasswordValidation, validate, authController.resetPassword);

module.exports = router;