const Permission = require('../models/Permission');

// Lấy tất cả quyền
exports.getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo quyền mới
exports.createPermission = async (req, res) => {
    const { name, description } = req.body;
    try {
        const permission = new Permission({ name, description });
        await permission.save();
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi tạo quyền', error: error.message });
    }
};

// Cập nhật quyền
exports.updatePermission = async (req, res) => {
    try {
        const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(permission);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi cập nhật quyền', error: error.message });
    }
};

// Xóa quyền
exports.deletePermission = async (req, res) => {
    try {
        await Permission.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quyền đã bị xóa' });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi xóa quyền', error: error.message });
    }
};
