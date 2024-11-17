const userModel = require("../../models/userModel");

async function updateUser(req, res) {
    try {
        const sessionUser = req.userId; // ID của người dùng hiện tại từ token
        const { name, phone, address } = req.body; // Chỉ lấy các trường cần thiết

        // Tạo payload chỉ với các trường có thể cập nhật
        const payload = {
            ...(name && { name }),
            ...(phone && { phone }), // Giả sử có trường 'phone' trong model
            ...(address && { address }), // Giả sử có trường 'address' trong model
        };

        // Cập nhật thông tin người dùng
        const updatedUser = await userModel.findByIdAndUpdate(sessionUser, payload, { new: true }); // 'new: true' để trả về tài liệu đã cập nhật

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        res.json({
            data: updatedUser,
            message: "User information updated successfully",
            success: true,
            error: false,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

module.exports = updateUser;
