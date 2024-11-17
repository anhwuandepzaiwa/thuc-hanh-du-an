const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Lấy thông tin chi tiết của người dùng hiện tại (chỉ người dùng đã đăng nhập mới được truy cập)
router.get('/me', authMiddleware.verifyToken, userController.getProfile);

// Chỉnh sửa thông tin cá nhân của người dùng hiện tại
router.put('/me', authMiddleware.verifyToken, userController.updateProfile);

// Lấy thông tin chi tiết của người dùng theo ID (chỉ cho admin/superadmin)
router.get('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.getUserById);

// Xóa người dùng theo ID (chỉ cho admin/superadmin)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.deleteUser);

// Lấy danh sách người dùng (chỉ cho admin/superadmin)
router.get('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, userController.getAllUsers);

module.exports = router;
