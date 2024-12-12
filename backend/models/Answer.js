const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID người dùng
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }, // ID kỳ thi
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }, // ID câu hỏi
    answer: { type: String, required: true }, // Câu trả lời của người dùng
    isCorrect: { type: Boolean, required: true }, // Trả lời đúng hay sai
    submittedAt: { type: Date, default: Date.now }, // Thời gian nộp câu trả lời
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
