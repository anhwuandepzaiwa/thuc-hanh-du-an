const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký tài khoản mới
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Xác thực email
router.get('/verify-email', authController.verifyEmail);

// Yêu cầu quên mật khẩu (gửi email để đặt lại mật khẩu)
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password', authController.resetPassword);

// Xác thực OTP
router.post('/verify-otp', authController.verifyOTP);

// Gửi lại xác thực
router.post('/resend-verify', authController.resendVerify);

module.exports = router;
