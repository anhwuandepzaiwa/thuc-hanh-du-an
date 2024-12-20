const jwt = require('jsonwebtoken');

// Middleware xác thực người dùng thông thường
exports.verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token)
            return res.status(403).json({
                message: "Token chưa được cung cấp",
                success: false
            });

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    message: "Truy cập bị từ chối",
                    success: false
                });
            }

            req.userId = decoded?._id;
            req.userRole = decoded?.role;

            next(); 
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi không xác định",
            success: false,
        });
    }
};

// Middleware xác thực admin
exports.verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({
            message: "Truy cập bị từ chối, chỉ có quyền ADMIN mới được phép",
            success: false,
        });
    }
    next(); 
};

exports.verifyRole = (roles) => {
    return (req, res, next) => {
        const token = req.cookies?.token; // Lấy token từ cookies
        if (!token) return res.status(401).send('Access Denied');

        try {
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
                if (roles.includes(req.user.role)) {
                next();
            } else {
                res.status(403).send('Permission Denied');
            }
                //next(); // Move to the next middleware or route
            })

            // Kiểm tra vai trò người dùng có nằm trong danh sách roles
            
        } catch (err) {
            res.status(400).send('Invalid Token');
        }
    };
};

// authMiddleware.js
const { hasPermission } = require('../middleware/roles');

exports.verifyPermission = (requiredPermission) => {
    return (req, res, next) => {
        const token = req.cookies?.token; // Lấy token từ cookies
        if (!token) return res.status(401).send('Access Denied');

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;

            // Kiểm tra quyền từ role
            if (hasPermission(req.user.role, requiredPermission)) {
                next();
            } else {
                res.status(403).send('Permission Denied');
            }
        } catch (err) {
            res.status(400).send('Invalid Token');
        }
    };
};

