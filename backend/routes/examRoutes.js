const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo kỳ thi mới (chỉ dành cho admin, superadmin, manager hoặc teacher)
router.post('/', examController.createExam);

// Lấy danh sách tất cả các kỳ thi (public)
router.get('/', examController.getAllExams);

// Lấy thông tin chi tiết về kỳ thi theo ID
router.get('/:id', examController.getExamById);

// Cập nhật thông tin kỳ thi (chỉ dành cho admin, superadmin, hoặc manager)
router.put('/:id', examController.updateExam);

// Xóa kỳ thi (chỉ dành cho admin hoặc superadmin)
router.delete('/:id', examController.deleteExam);

// Thêm câu hỏi vào kỳ thi (chỉ dành cho admin, superadmin, hoặc manager)
router.post('/:id/questions', examController.addQuestionsToExam);

// Lấy danh sách câu hỏi trong kỳ thi
router.get('/:id/questions', examController.getQuestionsFromExam);

// Bắt đầu kỳ thi (chỉ dành cho người dùng đã đăng nhập)
router.post('/:id/start', examController.startExam);

// Nộp bài thi (chỉ dành cho người dùng đã đăng nhập)
router.post('/:id/submit', examController.submitExam);

module.exports = router;
