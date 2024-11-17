const rateLimit = require('express-rate-limit');

// Tạo một bộ giới hạn số lần request
const signUpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Giới hạn 5 yêu cầu mỗi 15 phút từ cùng một IP
    message: "Too many accounts created from this IP, please try again after 15 minutes",
    standardHeaders: true, // Gửi thông tin giới hạn trong các tiêu đề response
    legacyHeaders: false, // Không gửi X-RateLimit-* headers
});

module.exports = signUpLimiter;

