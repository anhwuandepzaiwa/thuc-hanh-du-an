const jwt = require('jsonwebtoken');

// Middleware for authentication
async function authToken(req, res, next) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Please Login...!",
                error: true,
                success: false,
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    message: "Unauthorized access",
                    error: true,
                    success: false,
                });
            }

            req.userId = decoded?._id;
            req.userRole = decoded?.role;

            next(); // Move to the next middleware or route
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "An error occurred",
            error: true,
            success: false,
        });
    }
}

// Middleware for admin access
async function isAdmin(req, res, next) {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({
            message: "Access denied: admin only",
            error: true,
            success: false,
        });
    }
    next(); // Continue if admin
}

module.exports = {
    authToken,
    isAdmin
};
