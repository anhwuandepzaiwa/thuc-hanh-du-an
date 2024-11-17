const userModel = require('../models/userModel');

async function checkEmailConfirm(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false, error: true });
        }

        const user = await userModel.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false, error: true });
        }

        // Check if email is confirmed
        if (!user.isConfirmed) {
            return res.status(403).json({ message: "Email not confirmed", success: false, error: true });
        }

        // If email is confirmed, proceed to the next middleware or route
        next();
    } catch (err) {
        res.status(500).json({ message: err.message || "An error occurred", success: false, error: true });
    }
}

module.exports = checkEmailConfirm;
