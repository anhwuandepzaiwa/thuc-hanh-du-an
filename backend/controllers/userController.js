const User = require('../models/User');

// Get Profile (Lấy thông tin người dùng hiện tại)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId); // `req.user.id` được lấy từ middleware xác thực
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user profile', error: error.message });
    }
};

// Update Profile (Cập nhật thông tin người dùng hiện tại)
exports.updateProfile = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(req.userId); // Lấy người dùng từ `req.user.id`

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Cập nhật các trường nếu có
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully!', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// Get User by ID (Lấy thông tin người dùng theo ID)
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get user by ID', error: error.message });
    }
};

//  Delete User (Xóa người dùng theo ID)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

// Get All Users (Lấy danh sách tất cả người dùng)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
};

