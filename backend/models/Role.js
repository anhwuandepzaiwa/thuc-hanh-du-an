const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                const allowedRoles = ['superadmin', 'admin', 'manager', 'leader', 'teacher', 'user'];
                return allowedRoles.includes(value);
            },
            message: 'Tên vai trò không hợp lệ.',
        },
    },
    permissions: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
