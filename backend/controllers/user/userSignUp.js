const userModel = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const sendMail = require("../../helpers/send.mail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For generating OTP
require("dotenv").config();

async function userSignUpController(req, res) {
    try {
        const { email, password, confirmPassword, name } = req.body;

        // Validate input
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("Please provide a valid email");
        }
        if (!password || password.length < 8) {
            throw new Error("Password should be at least 8 characters long");
        }
        if (!confirmPassword) {
            throw new Error("Please confirm your password");
        }
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }
        if (!name) {
            throw new Error("Please provide a name");
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists. Please use a different email.",
                success: false
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Generate OTP and expiration time
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiryTime = 15 * 60 * 1000; // 15 minutes

        // Create user
        const userData = new userModel({
            email,
            password: hashPassword,
            name,
            role: "GENERAL",
            isConfirmed: false,
            otp,
            otpExpiresAt: new Date(Date.now() + otpExpiryTime)
        });

        const savedUser = await userData.save();
        const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24d' });
        savedUser.token = token;  
        await savedUser.save();

        const confirmationUrl = `http://localhost:8080/api/confirm-email?token=${token}`;
        await sendMail({
            email: savedUser.email,
            subject: "Please Confirm Your Email",
            html: `
                <h1>Welcome ${name}!</h1>
                <p>To confirm your email, please use one of the following options:</p>
                <ul>
                    <li>Enter this OTP: <strong>${otp}</strong></li>
                    <li>Or click the confirmation link: <a href="${confirmationUrl}">Confirm Email</a></li>
                </ul>
                <p>Note: The OTP expires in 15 minutes, and the link expires in 24 hours.</p>
            `
        });

        res.status(201).json({
            data: savedUser,
            success: true,
            error: false,
            message: "User created successfully! Please check your email to confirm your account."
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false
        });
    }
}

module.exports = userSignUpController;
