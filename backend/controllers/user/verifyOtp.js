const userModel = require("../../models/userModel");

async function verifyOtpController(req, res) {
    try {
        const email = req.body.email;
        const otp = req.body.otp.trim();

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required.",
                success: false
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Debugging logs
        console.log("Stored OTP:", user.otp);
        console.log("Entered OTP:", otp);
        console.log("Expiration Time:", user.otpExpiresAt);
        console.log("Current Time:", new Date());

        // Check if OTP matches
        if (user.otp.toString() !== otp.toString()) {
            return res.status(400).json({
                message: "Invalid OTP.",
                success: false
            });
        }

        // Check if OTP has expired
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                message: "OTP has expired.",
                success: false
            });
        }

        // Update confirmation and clear OTP
        user.isConfirmed = true;
        user.otp = null;
        user.otpExpiresAt = null;
        user.token = null;
        
        await user.save();

        res.status(200).json({
            message: "Account verified successfully!",
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "An error occurred.",
            success: false
        });
    }
}

module.exports = verifyOtpController;
