const userModel = require("../../models/userModel");
const mongoose = require('mongoose');

async function userDetailsController(req, res) {
    try {
        const userId = req.query.userId; // Get userId from query parameters
        console.log("Incoming userId:", userId);

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID format",
                error: true,
                success: false,
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Optionally exclude sensitive data like password
        const { password, ...safeUserData } = user._doc;

        res.status(200).json({
            data: safeUserData,
            error: false,
            success: true,
            message: "User details fetched successfully",
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

module.exports = userDetailsController;
