const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Tạo bài tập mới (chỉ dành cho teacher, manager, admin hoặc superadmin)
router.post('/create', authMiddleware.verifyToken, exerciseController.createExercise);

// Lấy danh sách tất cả bài tập (public)
router.get('/', exerciseController.getAllExercises);

// Lấy chi tiết bài tập theo ID
router.get('/:id', exerciseController.getExerciseById);

// Cập nhật bài tập theo ID (chỉ dành cho teacher, manager, admin hoặc superadmin)
router.put('/:id', exerciseController.updateExercise);

// Xóa bài tập theo ID (chỉ dành cho admin hoặc superadmin)
router.delete('/:id', exerciseController.deleteExercise);

// Lấy danh sách câu hỏi trong bài tập
router.get('/:id/questions', exerciseController.getQuestionsFromExercise);

// Nộp bài tập (chỉ dành cho người dùng đã đăng nhập)
router.post('/:id/submit', authMiddleware.verifyToken ,upload.single('file'),exerciseController.submitExercise);

// Route lấy bài nộp của sinh viên
router.get('/:id/submissions', authMiddleware.verifyToken, exerciseController.getStudentSubmissions);

// Route chấm điểm bài nộp
router.post('/:id/submissions/:submissionId/grade', authMiddleware.verifyToken, exerciseController.gradeSubmission);

// Route lấy điểm và nhận xét bài nộp
router.get('/:id/submissions/:submissionId/grade', authMiddleware.verifyToken, exerciseController.getSubmissionGrade);

module.exports = router;


