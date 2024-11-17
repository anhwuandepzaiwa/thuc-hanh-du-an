const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho Question
const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        trim: true
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: 'QuestionType',
    },
    bank: {
        type: Schema.Types.ObjectId,
        ref: 'QuestionBank',
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updateBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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

module.exports = mongoose.model('Question', questionSchema);
