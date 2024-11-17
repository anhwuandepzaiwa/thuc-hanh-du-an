const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Route quản lý quyền
router.get('/',  permissionController.getAllPermissions);
router.post('/', permissionController.createPermission);
router.put('/:id',  permissionController.updatePermission);
router.delete('/:id',  permissionController.deletePermission);

module.exports = router;
