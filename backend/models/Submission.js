const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho Submission
const submissionSchema = new Schema({
    exerciseId: {
        type: Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file: {
        type: String,
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    grade: {  // Điểm chấm
        type: Number,
        min: 0,
        max: 10
    },
    feedback: { // Nhận xét bài nộp
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);


