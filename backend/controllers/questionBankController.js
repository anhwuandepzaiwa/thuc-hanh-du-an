const QuestionBank = require('../models/QuestionBank');
const Question = require('../models/Question'); // Nếu bạn có model câu hỏi

// Tạo ngân hàng câu hỏi
const createQuestionBank = async (req, res) => {
    try {
        const { name, description, tags } = req.body;
        const createdBy = req.userId; // Giả sử req.user chứa thông tin người dùng đăng nhập

        const newBank = await QuestionBank.create({
            name,
            description,
            tags,
            createdBy,
        });

        res.status(201).json(newBank);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Lấy danh sách ngân hàng câu hỏi
const getQuestionBanks = async (req, res) => {
    try {
        const banks = await QuestionBank.find()
            .populate('createdBy', 'name email') // Lấy thông tin người tạo
            .populate('questions'); // Lấy danh sách câu hỏi

        res.status(200).json(banks);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Sửa ngân hàng câu hỏi
const updateQuestionBank = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, tags } = req.body;

        const updatedBank = await QuestionBank.findByIdAndUpdate(
            id,
            { name, description, tags, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedBank) {
            return res.status(404).json({ message: 'Không tìm thấy ngân hàng câu hỏi.' });
        }

        res.status(200).json(updatedBank);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Xóa ngân hàng câu hỏi
const deleteQuestionBank = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBank = await QuestionBank.findByIdAndDelete(id);
        if (!deletedBank) {
            return res.status(404).json({ message: 'Không tìm thấy ngân hàng câu hỏi.' });
        }

        res.status(200).json({ message: 'Đã xóa ngân hàng câu hỏi thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Thêm câu hỏi vào ngân hàng
const addQuestionToBank = async (req, res) => {
    try {
        const { bankId, questionId } = req.body;

        const bank = await QuestionBank.findById(bankId);
        if (!bank) {
            return res.status(404).json({ message: 'Không tìm thấy ngân hàng câu hỏi.' });
        }

        if (!bank.questions.includes(questionId)) {
            bank.questions.push(questionId);
            await bank.save();
        }

        res.status(200).json(bank);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

module.exports = {
    createQuestionBank,
    getQuestionBanks,
    updateQuestionBank,
    deleteQuestionBank,
    addQuestionToBank,
};
