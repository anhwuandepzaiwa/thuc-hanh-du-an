const userModel = require("../../models/userModel");
const mongoose = require('mongoose');

async function allUsers(req, res) 
{
    try {
        console.log("User ID from request:", req.userId);

        // Kiểm tra vai trò người dùng
        const user = await userModel.findById(req.userId);
        if (!user || user.role !== 'ADMIN') 
        {
            return res.status(403).json({
                message: "Access denied",
                error: true,
                success: false,
            });
        }

        // Lấy các tham số truy vấn cho phân trang
        const page = parseInt(req.query.page) || 1; // Mặc định là trang 1
        const limit = parseInt(req.query.limit) || 10; // Mặc định là 10 người dùng trên mỗi trang

        const users = await userModel.find()
            .skip((page - 1) * limit) // Bỏ qua số lượng người dùng đã được lấy
            .limit(limit); // Giới hạn số người dùng được trả về

        const totalUsers = await userModel.countDocuments(); // Đếm tổng số người dùng

        res.json({
            message: "All Users",
            data: users,
            total: totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            success: true,
            error: false,
        });
    } 
    catch (err) 
    {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

module.exports = allUsers;