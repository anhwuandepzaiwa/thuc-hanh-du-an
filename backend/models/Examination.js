const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho Examination
const examinationSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    questionBank: {
        type: Schema.Types.ObjectId,
        ref: 'QuestionBank',
        required: true
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    duration: {
        type: Number,  // Thời gian kỳ thi tính bằng phút
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passMarks: {
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });  // Tự động tạo createdAt và updatedAt

module.exports = mongoose.model('Examination', examinationSchema);
