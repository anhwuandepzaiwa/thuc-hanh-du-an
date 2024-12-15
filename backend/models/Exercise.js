const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho Exercise
const exerciseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {  // Ngày hết hạn
        type: Date,
        required: true
    },
    fileTypeAllowed: [  // Các loại tệp được phép nộp
        {
            type: String,
            required: true
        }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
