const userModel = require("../../models/userModel");
const crypto = require("crypto"); // For generating OTP
const sendMail = require("../../helpers/send.mail");
require("dotenv").config();

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Email not found.",
                success: false
            });
        }

        // Tạo OTP mới
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiryTime = 15 * 60 * 1000; // 15 minutes expiry

        // Cập nhật OTP và thời gian hết hạn OTP
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + otpExpiryTime);

        // Lưu thông tin người dùng
        await user.save();

        // Gửi OTP qua email
        await sendMail({
            email: user.email,
            subject: "Password Reset OTP",
            html: `
                <h1>Hello ${user.name},</h1>
                <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
                <p><strong>${otp}</strong></p>
                <p>The OTP will expire in 15 minutes.</p>
            `
        });

        res.status(200).json({
            message: "OTP sent successfully. Please check your email.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "An error occurred while sending OTP.",
            success: false
        });
    }
}

module.exports = forgotPassword;
