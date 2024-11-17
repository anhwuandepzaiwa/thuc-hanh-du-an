const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['superadmin', 'admin', 'manager', 'leader', 'teacher', 'user'],
    },
    permissions: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
