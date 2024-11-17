const userModel = require("../../models/userModel");

async function deleteUser(req, res) {
    try {
        const userId = req.userId; // Get user ID from the token
        
        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        res.json({
            message: "Account deleted successfully",
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

module.exports = deleteUser;
