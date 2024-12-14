const Permission = require('../models/Permission');

// Lấy tất cả quyền
exports.getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách quyền.', error: error.message });
    }
};

// Tạo quyền mới
exports.createPermission = async (req, res) => {
    const { name, description } = req.body;

    // Kiểm tra input
    if (!name || !description) {
        return res.status(400).json({ message: 'Tên và mô tả quyền là bắt buộc.' });
    }

    try {
        // Kiểm tra quyền đã tồn tại hay chưa
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ message: 'Quyền với tên này đã tồn tại.' });
        }

        const permission = new Permission({ name, description });
        await permission.save();

        res.status(201).json({ message: 'Quyền được tạo thành công.', data: permission });
    } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ message: 'Lỗi tạo quyền.', error: error.message });
    }
};

// Cập nhật quyền
exports.updatePermission = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    // Kiểm tra input
    if (!name && !description) {
        return res.status(400).json({ message: 'Phải có ít nhất một trường để cập nhật (name hoặc description).' });
    }

    try {
        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({ message: 'Không tìm thấy quyền với ID này.' });
        }

        // Cập nhật dữ liệu
        permission.name = name || permission.name;
        permission.description = description || permission.description;

        const updatedPermission = await permission.save();

        res.status(200).json({ message: 'Cập nhật quyền thành công.', data: updatedPermission });
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ message: 'Lỗi cập nhật quyền.', error: error.message });
    }
};

// Xóa quyền
exports.deletePermission = async (req, res) => {
    const { id } = req.params;

    try {
        // Xóa trực tiếp bằng findByIdAndDelete
        const deletedPermission = await Permission.findByIdAndDelete(id);

        if (!deletedPermission) {
            return res.status(404).json({ message: 'Không tìm thấy quyền với ID này.' });
        }

        res.status(200).json({ message: 'Quyền đã bị xóa thành công.' });
    } catch (error) {
        console.error('Error deleting permission:', error);
        res.status(500).json({ message: 'Lỗi xóa quyền.', error: error.message });
    }
};
