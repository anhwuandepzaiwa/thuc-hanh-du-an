const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Tạo câu hỏi mới (chỉ cho teacher, manager, admin hoặc superadmin)
router.post('/',  authMiddleware.verifyToken, questionController.createQuestion);

// Lấy danh sách câu hỏi (public)
router.get('/', questionController.getAllQuestions);

// Cập nhật câu hỏi theo ID (chỉ cho teacher, manager, admin hoặc superadmin)
router.put('/:id', authMiddleware.verifyToken, questionController.updateQuestion);

// Xóa câu hỏi theo ID (chỉ cho admin hoặc superadmin)
router.delete('/:id',  questionController.deleteQuestion);

// Import câu hỏi vào ngân hàng (chỉ cho admin hoặc superadmin)
router.post('/import', questionController.importQuestions);

// Export câu hỏi từ ngân hàng (chỉ cho admin hoặc superadmin)
router.get('/export',  questionController.exportQuestions);

// Lấy chi tiết câu hỏi theo ID (public)
router.get('/:id', questionController.getQuestionById);

module.exports = router;
