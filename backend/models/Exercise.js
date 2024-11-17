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
        type: Number,
        required: true
    },
    totalMarks: {
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
