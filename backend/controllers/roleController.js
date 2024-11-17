const Role = require('../models/Role');
const Permission = require('../models/Permission');
// Lấy tất cả các vai trò
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo Role
exports.createRole = async (req, res) => {
    const { name, permissions } = req.body;
    try {
        // Tìm Permission
        const permissionDocs = await Permission.find({ _id: { $in: permissions } });
        if (permissionDocs.length !== permissions.length) {
            return res.status(404).json({ message: 'Một số quyền không tồn tại.' });
        }

        const role = new Role({ name, permissions });
        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi tạo Role.', error: error.message });
    }
};

// Cập nhật vai trò
exports.updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi cập nhật vai trò', error: error.message });
    }
};

// Xóa vai trò
exports.deleteRole = async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vai trò đã bị xóa' });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi xóa vai trò', error: error.message });
    }
};

// Lấy quyền của một vai trò
exports.getRolePermissions = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        res.json(role.permissions);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi lấy quyền của vai trò', error: error.message });
    }
};

// Gán quyền cho vai trò
exports.assignPermissionsToRole = async (req, res) => {
    const { permissions } = req.body;
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, { $set: { permissions } }, { new: true });
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi gán quyền cho vai trò', error: error.message });
    }
};
