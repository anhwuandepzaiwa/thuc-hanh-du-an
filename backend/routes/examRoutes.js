const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo kỳ thi mới (chỉ dành cho admin, superadmin, manager hoặc teacher)
router.post('/create', examController.createExam);

// Lấy danh sách tất cả các kỳ thi (public)
router.get('/', examController.getAllExams);

// Lấy thông tin chi tiết về kỳ thi theo ID
router.get('/:id', examController.getExamById);

// Cập nhật thông tin kỳ thi (chỉ dành cho admin, superadmin, hoặc manager)
router.put('/:id', examController.updateExam);

// Xóa kỳ thi (chỉ dành cho admin hoặc superadmin)
router.delete('/:id', examController.deleteExam);

// Đăng ký tham gia kỳ thi 
router.post('/:examId/register', examController.registerForExam);

// Bắt đầu kỳ thi 
router.post('/:examId/start', examController.startExam);

// Kết thúc kỳ thi
router.post('/:examId/end', examController.endExam);

// Nộp bài thi
router.post('/:examId/submit', examController.submitExam);

// Lấy kết quả thi
router.get('/examId/results', examController.getExamResults);

// Thống kê kỳ thi
router.get('/:examId/statistics', examController.getExamStatistics);

module.exports = router;
