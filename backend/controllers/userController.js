const User = require('../models/User');
const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('profile'); // Populate the profile field

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user); // Return the user with populated profile
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve user profile', error: error.message });
    }
};


// Update Profile (Cập nhật thông tin người dùng hiện tại)
exports.updateProfile = async (req, res) => {
    const { fullName, dateOfBirth, gender, phoneNumber, address, bio } = req.body;

    try {
        const user = await User.findById(req.userId); // Lấy người dùng từ `req.user.id`

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Cập nhật thông tin Profile (Không bao gồm username, email và password)
        let profile = await Profile.findOne({ user: user._id });

        if (!profile) {
            // Nếu chưa có profile, tạo mới
            profile = new Profile({
                user: user._id,
                fullName,
                dateOfBirth,
                gender,
                phoneNumber,
                address,
                bio
            });
        } else {
            if (fullName) profile.fullName = fullName;
            if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
            if (gender) profile.gender = gender;
            if (phoneNumber) profile.phoneNumber = phoneNumber;
            if (address) profile.address = address;
            if (bio) profile.bio = bio;
        }

        // Lưu thông tin profile
        await profile.save();

        res.status(200).json({ message: 'Profile updated successfully!', profile });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
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

