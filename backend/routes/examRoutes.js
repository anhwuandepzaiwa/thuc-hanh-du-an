const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo kỳ thi mới (chỉ dành cho admin, superadmin, manager hoặc teacher)
router.post('/create', authMiddleware.verifyToken ,examController.createExam);

// Lấy danh sách tất cả các kỳ thi (public)
router.get('/', examController.getAllExams);

// Lấy thông tin chi tiết về kỳ thi theo ID
router.get('/:id', examController.getExamById);

// Cập nhật thông tin kỳ thi (chỉ dành cho admin, superadmin, hoặc manager)
router.put('/:examId', examController.updateExam);

// Xóa kỳ thi (chỉ dành cho admin hoặc superadmin)
router.delete('/:id', examController.deleteExam);

// Thêm câu hỏi vào kỳ thi
router.post('/add-questions', examController.addQuestionsToExam);

// Đăng ký tham gia kỳ thi 
router.post('/:examId/register', authMiddleware.verifyToken,examController.registerForExam);

// Bắt đầu kỳ thi 
router.post('/:examId/start', authMiddleware.verifyToken, examController.startExam);

// Nộp bài thi
router.post('/:examId/submit', authMiddleware.verifyToken, examController.submitExam);

// Lấy kết quả thi
router.get('/:examId/results', authMiddleware.verifyToken, examController.getExamResults);

// Thống kê kỳ thi
router.get('/:examId/statistics', examController.getExamStatistics);

// Lấy câu hỏi từ kỳ thi 
router.get('/:examId/questions', authMiddleware.verifyToken, examController.getQuestionsFromExam);

module.exports = router;
