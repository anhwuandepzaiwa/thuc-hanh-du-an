const express = require('express');
const router = express.Router();
const {
    createQuestionType,
    getQuestionTypes,
    updateQuestionType,
    deleteQuestionType
} = require('../controllers/questionTypeController');

// Route cho quản lý loại câu hỏi
router.post('/', createQuestionType);       // Tạo loại câu hỏi
router.get('/', getQuestionTypes);          // Lấy danh sách loại câu hỏi
router.put('/:id', updateQuestionType);     // Sửa loại câu hỏi
router.delete('/:id', deleteQuestionType);  // Xóa loại câu hỏi

module.exports = router;
