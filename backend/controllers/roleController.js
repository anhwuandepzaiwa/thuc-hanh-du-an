const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Lấy tất cả các vai trò(chỉ có superadmin mới có quyền)
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions', 'name description');
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// Tạo Role(chỉ có superadmin mới có quyền)
exports.createRole = async (req, res) => {
    const { name, permissions } = req.body;

    try {
        // Kiểm tra trùng lặp tên vai trò
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Vai trò đã tồn tại.' });
        }

        // Tìm và kiểm tra quyền
        const permissionDocs = await Permission.find({ _id: { $in: permissions } });
        if (permissionDocs.length !== permissions.length) {
            return res.status(404).json({ message: 'Một số quyền không tồn tại.' });
        }

        // Tạo vai trò
        const role = new Role({ name, permissions });
        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo vai trò.', error: error.message });
    }
};

// Cập nhật vai trò(chỉ có superadmin mới có quyền)
exports.updateRole = async (req, res) => {
    const { name, permissions } = req.body;

    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy vai trò với ID này.' });
        }

        // Nếu có tên mới, kiểm tra trùng lặp
        if (name && name !== role.name) {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({ message: 'Tên vai trò đã tồn tại.' });
            }
        }

        // Nếu có quyền mới, kiểm tra quyền tồn tại
        if (permissions) {
            const permissionDocs = await Permission.find({ _id: { $in: permissions } });
            if (permissionDocs.length !== permissions.length) {
                return res.status(404).json({ message: 'Một số quyền không tồn tại.' });
            }
        }

        // Cập nhật vai trò
        role.name = name || role.name;
        role.permissions = permissions || role.permissions;
        await role.save();

        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật vai trò.', error: error.message });
    }
};

// Xóa vai trò(chỉ có superadmin mới có quyền)
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy vai trò với ID này.' });
        }

        await role.deleteOne();
        res.status(200).json({ message: 'Vai trò đã bị xóa thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa vai trò.', error: error.message });
    }
};

// Lấy quyền của một vai trò(chỉ có superadmin mới có quyền)
exports.getRolePermissions = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions', 'name description');

        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy vai trò với ID này.' });
        }

        res.status(200).json(role.permissions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy quyền của vai trò.', error: error.message });
    }
};

// Gán quyền cho vai trò(chỉ có superadmin mới có quyền)
exports.assignPermissionsToRole = async (req, res) => {
    const { permissions } = req.body;

    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Không tìm thấy vai trò với ID này.' });
        }

        const permissionDocs = await Permission.find({ _id: { $in: permissions } });
        if (permissionDocs.length !== permissions.length) {
            return res.status(404).json({ message: 'Một số quyền không tồn tại.' });
        }

        role.permissions = permissions;
        await role.save();

        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi gán quyền cho vai trò.', error: error.message });
    }
};
