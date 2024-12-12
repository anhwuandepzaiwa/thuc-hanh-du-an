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
    subject: {  // Thêm môn học
        type: String,
        required: true
    },
    difficulty: {  // Thêm mức độ khó
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    questionBank: {
        type: Schema.Types.ObjectId,
        ref: 'QuestionBank',
        required: true
    },
    questions: [{  // Thêm câu hỏi vào bài tập
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    duration: {  // Thêm thời gian hoàn thành
        type: Number,
        required: true
    },
    totalMarks: {  // Tổng điểm bài tập
        type: Number,
        required: true
    },
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
    tags: [{
        type: String,
        trim: true
    }],
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
