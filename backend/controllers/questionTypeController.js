const QuestionType = require('../models/QuestionType');

// Tạo loại câu hỏi
const createQuestionType = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Tên loại câu hỏi không được để trống.' });
        }

        const existingType = await QuestionType.findOne({ name });
        if (existingType) {
            return res.status(400).json({ message: 'Loại câu hỏi đã tồn tại.' });
        }

        const newType = new QuestionType({ name, description });
        await newType.save();
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};


// Lấy danh sách loại câu hỏi
const getQuestionTypes = async (req, res) => {
    try {
        const questionTypes = await QuestionType.find();
        res.status(200).json(questionTypes);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Cập nhật loại câu hỏi
const updateQuestionType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Tên loại câu hỏi không được để trống.' });
        }

        const updatedType = await QuestionType.findByIdAndUpdate(
            id,
            { name, description, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedType) {
            return res.status(404).json({ message: 'Không tìm thấy loại câu hỏi.' });
        }

        res.status(200).json(updatedType);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

// Xóa loại câu hỏi
const deleteQuestionType = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedType = await QuestionType.findByIdAndDelete(id);
        if (!deletedType) {
            return res.status(404).json({ message: 'Không tìm thấy loại câu hỏi.' });
        }

        res.status(200).json({ message: 'Đã xóa loại câu hỏi thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi.', error: error.message });
    }
};

module.exports = {
    createQuestionType,
    getQuestionTypes,
    updateQuestionType,
    deleteQuestionType,
};
