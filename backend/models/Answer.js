const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: String, required: true },  // Câu trả lời của người dùng
    isCorrect: { type: Boolean, required: true }  // Trường xác định đáp án đúng hay sai
}, {
    timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
