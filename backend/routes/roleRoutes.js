const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware để kiểm tra quyền truy cập
const requireAdminOrSuperAdmin = authMiddleware.verifyRole(['admin', 'superadmin']);
const requireSuperAdmin = authMiddleware.verifyRole(['superadmin']);

// Route quản lý vai trò
router.get('/', roleController.getAllRoles); // Lấy danh sách vai trò
router.post('/', roleController.createRole); // Tạo vai trò mới
router.put('/:id', roleController.updateRole); // Cập nhật vai trò
router.delete('/:id',  roleController.deleteRole); // Xóa vai trò (chỉ superadmin)
router.get('/:id/permissions',  roleController.getRolePermissions); // Lấy danh sách quyền của vai trò
router.post('/:id/permissions', roleController.assignPermissionsToRole); // Gán quyền cho vai trò

module.exports = router;
