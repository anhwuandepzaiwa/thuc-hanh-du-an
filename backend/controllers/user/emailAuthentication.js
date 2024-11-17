const jwt = require("jsonwebtoken");
const userModel = require("../../models/userModel");
require("dotenv").config();

async function confirmEmailController(req, res) {
    try {
        const token = req.query.token?.trim();

        if (!token) {
            return res.status(400).json({
                message: "No token provided.",
                success: false
            });
        }

        // Verify the token
        jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, decoded) => {
            if (err) {
                console.error("Token verification failed:", err.message);
                return res.status(400).json({
                    message: "Invalid or expired confirmation link.",
                    success: false
                });
            }

            const user = await userModel.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found.",
                    success: false
                });
            }

            if (user.isConfirmed) {
                return res.status(400).json({
                    message: "Email is already confirmed.",
                    success: false
                });
            }

            user.isConfirmed = true;
            user.token = null;
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();

            res.status(200).json({
                message: "Email confirmed successfully!",
                success: true
            });
        });
    } catch (err) {
        console.error("An error occurred during email confirmation:", err.message);
        res.status(500).json({
            message: "An error occurred during email confirmation.",
            success: false
        });
    }
}

module.exports = confirmEmailController;
