const userModel = require("../../models/userModel");
const crypto = require("crypto"); // For generating OTP
const jwt = require("jsonwebtoken");
const sendMail = require("../../helpers/send.mail");
require("dotenv").config();

async function refreshConfirmationData(req, res) {
    try {
        const { email } = req.body; // Email is sent in request body

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Check if the account is already confirmed
        if (user.isConfirmed) {
            return res.status(400).json({
                message: "Your account is already confirmed.",
                success: false
            });
        }

        // Check if the OTP or confirmation link has expired
        const otpExpired = user.otpExpiresAt < Date.now();
        const linkExpired = !user.isConfirmed && jwt.verify(user.token, process.env.TOKEN_SECRET_KEY).exp < Date.now() / 1000;

        if (!otpExpired && !linkExpired) {
            return res.status(400).json({
                message: "Both OTP and confirmation link are still valid.",
                success: false
            });
        }

        // If OTP is expired, generate a new OTP and update the expiry time
        if (otpExpired) {
            const newOtp = crypto.randomInt(100000, 999999);
            const otpExpiryTime = 15 * 60 * 1000; // 15 minutes
            user.otp = newOtp;
            user.otpExpiresAt = new Date(Date.now() + otpExpiryTime);
        }

        // If link is expired, generate a new token and update it
        if (linkExpired) {
            const newToken = jwt.sign({ id: user._id, email: user.email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24h' });
            user.token = newToken;
        }

        // Save the updated user document
        await user.save();

        // Prepare confirmation URL and email content
        const confirmationUrl = `http://localhost:8080/api/confirm-email?token=${user.token}`;
        await sendMail({
            email: user.email,
            subject: "Your OTP or Confirmation Link Has Been Refreshed",
            html: `
                <h1>Hello ${user.name},</h1>
                <p>Your OTP has expired, or the confirmation link has expired. Please use one of the following options to confirm your email:</p>
                <ul>
                    <li>Enter this OTP: <strong>${user.otp}</strong></li>
                    <li>Or click the confirmation link: <a href="${confirmationUrl}">Confirm Email</a></li>
                </ul>
                <p>Note: The OTP expires in 15 minutes, and the link expires in 24 hours.</p>
            `
        });

        res.status(200).json({
            message: "OTP or confirmation link refreshed successfully. Please check your email.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: err.message || "An error occurred while refreshing OTP or confirmation link.",
            success: false
        });
    }
}

module.exports = refreshConfirmationData;
