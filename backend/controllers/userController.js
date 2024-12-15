const User = require('../models/User');
const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('profile'); 

        if (!user) {
            return res.status(404).json({ message: 'Lỗi không tìm thấy người dùng' });
        }

        res.status(200).json(user); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy thông tin người dùng', error: error.message });
    }
};


// Update Profile (Cập nhật thông tin người dùng hiện tại)
exports.updateProfile = async (req, res) => {
    const { fullName, dateOfBirth, gender, phoneNumber, address, bio } = req.body;

    try {
        const user = await User.findById(req.userId); // Lấy người dùng từ `req.user.id`

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
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

        res.status(200).json({ message: 'Thông tin đã được cập nhật thành công!', profile });
    } catch (error) {
        res.status(500).json({ message: 'Cập nhật thông tin thất bại'});
    }
};

//  Delete User (Xóa người dùng theo ID chỉ superadmin và admin mới có quyền)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.status(200).json({ message: 'Xóa người dùng thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Xóa người dùng thất bại'});
    }
};

// Get All Users (Lấy danh sách tất cả người dùng chỉ có superadmin, admin và maneger mới có quyền)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy người dùng', error: error.message });
    }
};

