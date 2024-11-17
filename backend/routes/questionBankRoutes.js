const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const {
    createQuestionBank,
    getQuestionBanks,
    updateQuestionBank,
    deleteQuestionBank,
    addQuestionToBank
} = require('../controllers/questionBankController');

// Route cho quản lý ngân hàng câu hỏi
router.post('/',authMiddleware.verifyToken,createQuestionBank);           // Tạo ngân hàng câu hỏi
router.get('/', getQuestionBanks);              // Lấy danh sách ngân hàng câu hỏi
router.put('/:id', updateQuestionBank);         // Sửa ngân hàng câu hỏi
router.delete('/:id', deleteQuestionBank);      // Xóa ngân hàng câu hỏi
router.post('/add-question', addQuestionToBank); // Thêm câu hỏi vào ngân hàng

module.exports = router;
