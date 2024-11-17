const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendMail = require("../helpers/send.mail");
const crypto = require("crypto");

//Register (Đăng ký người dùng)
exports.register = async (req, res) => {
    try {
        const { email, password, confirmPassword, username } = req.body;

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
        if (!username) {
            throw new Error("Please provide a username");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists. Please use a different email.",
                success: false
            });
        }

        // Generate OTP and expiration time
        const otp = crypto.randomInt(100000, 999999);
        const otpExpiryTime = 15 * 60 * 1000; // 15 minutes

        // Create user
        const userData = new User({
            email,
            password: password,
            username,
            otp,
            otpExpiresAt: new Date(Date.now() + otpExpiryTime)
        });

        const savedUser = await userData.save();
        const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '24d' });
        savedUser.token = token;  
        await savedUser.save();

        const confirmationUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;
        await sendMail({
            email: savedUser.email,
            subject: "Please Confirm Your Email",
            html: `
                <h1>Welcome ${username}!</h1>
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
};

//Login (Đăng nhập người dùng)
exports.login = async (req, res) => {
    try{
        const { email , password} = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("Please provide a valid email");
        }
        if (!password || password.length < 8) {
            throw new Error("Password should be at least 8 characters long");
        }

        const user = await User.findOne({email})

        if(!user)
        {
            throw new Error("User not found")
        }

       const checkPassword = await bcrypt.compare(password,user.password)

        if(checkPassword)
        {
        const tokenData = {
            _id : user._id,
            email : user.email,
            role: user.role
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 8 });

        const tokenOption = {
            httpOnly : true,
            secure : true,
            sameSite : 'None'
        }

        res.cookie("token",token,tokenOption).status(200).json({
            message : "Login successfully",
            data: {
                token,  
                name: user.name,  
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            },
            success : true,
            error : false
        })

        }
        else
        {
         throw new Error("Please check Password");
        }
    }
    catch(err)
    {
        res.json({
            message : err.message || err,
            error : true,
            success : false,
        })
    }
};

//Verify Email (Xác thực email)
exports.verifyEmail = async (req, res) => {
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

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found.",
                    success: false
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    message: "Email is already confirmed.",
                    success: false
                });
            }

            user.isEmailVerified = true;
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
};

//Forgot Password (Quên mật khẩu)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const user = await User.findOne({ email });
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
                <h1>Hello ${user.username},</h1>
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
};

//Reset Password (Đặt lại mật khẩu)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Kiểm tra người dùng với email đó
        const user = await User.findOne({ email });
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

        // Cập nhật mật khẩu mới và xóa OTP
        user.password = confirmPassword;
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
};

// Verify OTP (Xác thực OTP)
exports.verifyOTP = async (req, res) => {
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
};

// resend verification token (Làm mới mã xác minh)
exports.resendVerify = async (req, res) => {
    try {
        const { email } = req.body; // Email is sent in request body

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Check if the account is already confirmed
        if (user.isEmailVerified) {
            return res.status(400).json({
                message: "Your account is already confirmed.",
                success: false
            });
        }

        // Check if the OTP or confirmation link has expired
        const otpExpired = user.otpExpiresAt < Date.now();

        // Ensure the token exists before checking the expiration
        let linkExpired = false;
        if (user.token) {
            try {
                linkExpired = !user.isEmailVerified && jwt.verify(user.token, process.env.TOKEN_SECRET_KEY).exp < Date.now() / 1000;
            } catch (err) {
                console.error('Error verifying token:', err);
                linkExpired = true;  // If there's an error verifying the token, treat it as expired
            }
        }

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
        const confirmationUrl = `http://localhost:3000/api/auth/verify-email?token=${newToken}`;
        await sendMail({
            email: user.email,
            subject: "Please Confirm Your Email",
            html: `
                <h1>Welcome ${user.username}!</h1>
                <p>To confirm your email, please use one of the following options:</p>
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
};
