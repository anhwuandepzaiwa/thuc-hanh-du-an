const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionTypeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tên loại câu hỏi là bắt buộc'],
        unique: true,
        trim: true,
        minlength: [3, 'Tên loại câu hỏi phải có ít nhất 3 ký tự'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Mô tả không được quá 500 ký tự'],
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

module.exports = mongoose.model('QuestionType', questionTypeSchema);
