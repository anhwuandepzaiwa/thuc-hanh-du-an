const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");

async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Kiểm tra người dùng với email đó
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Email not found.",
                success: false
            });
        }

        // Kiểm tra OTP có hợp lệ không và thời gian hết hạn
        if (user.otp.toString() != otp.toString()) {
            return res.status(400).json({
                message: "Invalid OTP.",
                success: false
            });
        }

        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({
                message: "OTP has expired.",
                success: false
            });
        }

        // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu có khớp không
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match.",
                success: false
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Cập nhật mật khẩu mới và xóa OTP
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiresAt = null;

        // Lưu người dùng với mật khẩu mới
        await user.save();

        res.status(200).json({
            message: "Password updated successfully.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "An error occurred while resetting the password.",
            success: false
        });
    }
}

module.exports = resetPassword;
