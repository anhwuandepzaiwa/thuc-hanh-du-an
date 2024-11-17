const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho QuestionBank (Ngân hàng câu hỏi)
const questionBankSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu đến User model, người tạo ngân hàng câu hỏi
        required: true,
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question', // Tham chiếu đến Question model
    }],
    tags: [{
        type: String,
        trim: true,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);
