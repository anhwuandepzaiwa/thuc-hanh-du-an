const userModel = require("../../models/userModel");
const mongoose = require('mongoose');

async function deleteAdminUser(req, res) {
    try {
        const userId = req.query.userId; 

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format",
                error: true,
                success: false,
            });
        }

        const deletedUser = await userModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        res.json({
            message: "User deleted successfully",
            error: false,
            success: true,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

module.exports = deleteAdminUser;