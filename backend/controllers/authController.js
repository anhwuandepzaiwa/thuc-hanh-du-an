const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendMail = require("../helpers/send.mail");
const crypto = require("crypto");
const Profile = require('../models/Profile');

//Register (Đăng ký người dùng)
exports.register = async (req, res) => {
    try {
        const { email, password, confirmPassword, username } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
        if(!password) {
            return res.status(400).json({
                message: "Vui lòng cung cấp mật khẩu",
                success: false
            });
        }else if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Mật khẩu phải bao gồm ít nhất 8 ký tự một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.",
                success: false
            });
        }

        if (!confirmPassword) {
            return res.status(400).json({
                message: "Vui lòng cung cấp xác nhận mật khẩu",
                success: false
            });
        }
        else if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu và xác nhận mật khẩu không khớp",
                success: false
            });
        }
        
        const nameRegex = /^[a-zA-Z0-9\s]{2,50}$/;
        if(!username){
            return res.status(400).json({
                message: "Vui lòng cung cấp tên",
                success: false
            });
        }else if (!nameRegex.test(username)) {
            return res.status(400).json({
                message: "Tên phải chứa ít nhất 2 ký tự và không chứa ký tự đặc biệt.",
                success: false
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: "Người dùng đã tồn tại với email này",
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

        const profile = new Profile({
            user: savedUser._id, 
        });
        
        await profile.save();

        savedUser.profile = profile._id;
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
            message: "User created successfully! Please check your email to confirm your account."
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            success: false
        });
    }
};

//Login (Đăng nhập người dùng)
exports.login = async (req, res) => {
    try{
        const { email , password} = req.body

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!password) {
            return res.status(400).json({
                message: "Vui lòng cung cấp mật khẩu",
                success: false
            });
        }else if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Mật khẩu phải bao gồm ít nhất 8 ký tự một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.",
                success: false
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                message: "Không tìm thấy người dùng với email này",
                success: false
            });
        }
        
        if(!password){
            return res.status(400).json({
                message: "Vui lòng cung cấp mật khẩu",
                success: false
            });
        }

        if(!user.isEmailVerified){
            return res.status(403).json({
                message: "Email chưa được xác nhận",
                success: false
            });
        }

        const checkPassword = await bcrypt.compare(password,user.password)

        if(checkPassword)
        {
        const tokenData = {
            _id : user._id,
            email : user.email,
            role: user.role
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({
            message : "Đăng nhập thành công",
            data: {
                token,  
                username: user.username,  
                email: user.email,
                isConfirmed: user.isConfirmed
            },
            success : true,
        })

        }
        else
        {
            return res.status(400).json({
                message : "Mật khẩu không chính xác",
                success : false
            });
        }
    }
    catch(err)
    {
        console.log(err)
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
                message: "Không tìm thấy token trong yêu cầu.",
                success: false
            });
        }

        // Verify the token
        jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    message: "Liên kết xác nhận không hợp lệ hoặc đã hết hạn.",
                    success: false
                });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({
                    message: "Người dùng không tồn tại.",
                    success: false
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    message: "Email đã được xác nhận trước đó.",
                    success: false
                });
            }

            user.isEmailVerified = true;
            user.token = null;
            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();

            res.status(200).json({
                message: "Email đã được xác nhận thành công.",
                success: true
            });
        });
    } catch (err) {
        res.status(500).json({
            message: "Lỗi khi xác nhận email: " + err.message,
            success: false
        });
    }
};

//Forgot Password (Quên mật khẩu)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Email không tồn tại.",
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
            message: "OTP đã được gửi thành công qua email.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "Lỗi không xác định",
            success: false
        });
    }
};

//Reset Password (Đặt lại mật khẩu)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
        if(!newPassword) {
            return res.status(400).json({
                message: "Vui lòng cung cấp mật khẩu",
                success: false
            });
        }else if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "Mật khẩu phải bao gồm ít nhất 8 ký tự một chữ hoa, một chữ thường, một số và một ký tự đặc biệt.",
                success: false
            });
        }

        if (!confirmPassword) {
            return res.status(400).json({
                message: "Vui lòng cung cấp xác nhận mật khẩu",
                success: false
            });
        }
        else if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu và xác nhận mật khẩu không khớp",
                success: false
            });
        }

        // Kiểm tra người dùng với email đó
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Nguời dùng không tồn tại.",
                success: false
            });
        }

        // Kiểm tra OTP có hợp lệ không và thời gian hết hạn
        if (user.otp.toString() != otp.toString()) {
            return res.status(400).json({
                message: "Mã OTP không hợp lệ.",
                success: false
            });
        }

        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({
                message: "Mã OTP đã hết hạn.",
                success: false
            });
        }

        // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu có khớp không
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
                success: false
            });
        }

        // Cập nhật mật khẩu mới và xóa OTP
        user.password = newPassword;
        user.otp = null;
        user.otpExpiresAt = null;

        // Lưu người dùng với mật khẩu mới
        await user.save();

        res.status(200).json({
            message: "Mât khẩu đã được cập nhật thành công.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || "Lỗi không xác định",
            success: false
        });
    }
};

// Verify OTP (Xác thực OTP)
exports.verifyOTP = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.otp.trim();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        if (!otp) {
            return res.status(400).json({
                message: "Mã OTP không được để trống.",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "Người dùng không tồn tại.",
                success: false
            });
        }

        if (user.otp.toString() !== otp.toString()) {
            return res.status(400).json({
                message: "Mã OTP không hợp lệ.",
                success: false
            });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                message: "Mã OTP đã hết hạn.",
                success: false
            });
        }

        user.isEmailVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        user.token = null;
        
        await user.save();

        res.status(200).json({
            message: "Tài khoản đã được xác thực thành công.",
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Lỗi không xác định",
            success: false
        });
    }
};

// resend verification token (Làm mới mã xác minh)
exports.resendVerify = async (req, res) => {
    try {
        const { email } = req.body; 

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!email) {
            return res.status(400).json({
                message: "Vui lòng cung cấp email",
                success: false
            });
        }else if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Người dùng không được tìm thấy", success: false });
        }

        if (user.isConfirmed) {
            return res.status(400).json({
                message: "Tài khoan đã được xác nhận. Không thể làm mới OTP hoặc liên kết xác nhận.",
                success: false
            });
        }

        const otpExpired = user.otpExpiresAt < Date.now();

        let linkExpired = false;
        if (user.token) {
            try {
                linkExpired = !user.isConfirmed && jwt.verify(user.token, process.env.TOKEN_SECRET_KEY).exp < Date.now() / 1000;
            } catch (err) {
                linkExpired = true;  
            }
        }

        if (!otpExpired && !linkExpired) {
            return res.status(400).json({
                message: "Cả OTP và liên kết xác nhận đều còn hiệu lực. Không cần làm mới.",
                success: false
            });
        }

        if (otpExpired) {
            const newOtp = crypto.randomInt(100000, 999999);
            const otpExpiryTime = 15 * 60 * 1000; // 15 minutes
            user.otp = newOtp;
            user.otpExpiresAt = new Date(Date.now() + otpExpiryTime);
        }

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
                <h1>Hello ${user.username},</h1>
                <p>Your OTP has expired, or the confirmation link has expired. Please use one of the following options to confirm your email:</p>
                <ul>
                    <li>Enter this OTP: <strong>${user.otp}</strong></li>
                    <li>Or click the confirmation link: <a href="${confirmationUrl}">Confirm Email</a></li>
                </ul>
                <p>Note: The OTP expires in 15 minutes, and the link expires in 24 hours.</p>
            `
        });

        res.status(200).json({
            message: "Mã OTP hoặc liên kết xác nhận đã được làm mới thành công.",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: err.message || "Lỗi không xác định",
            success: false
        });
    }
};
