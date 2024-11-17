const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/authMiddleware');

// Tạo bài tập mới (chỉ dành cho teacher, manager, admin hoặc superadmin)
router.post('/', authMiddleware.verifyRole(['teacher', 'manager', 'admin', 'superadmin']), exerciseController.createExercise);

// Lấy danh sách tất cả bài tập (public)
router.get('/', exerciseController.getAllExercises);

// Lấy chi tiết bài tập theo ID
router.get('/:id', exerciseController.getExerciseById);

// Cập nhật bài tập theo ID (chỉ dành cho teacher, manager, admin hoặc superadmin)
router.put('/:id', authMiddleware.verifyRole(['teacher', 'manager', 'admin', 'superadmin']), exerciseController.updateExercise);

// Xóa bài tập theo ID (chỉ dành cho admin hoặc superadmin)
router.delete('/:id', authMiddleware.verifyRole(['admin', 'superadmin']), exerciseController.deleteExercise);

// Thêm câu hỏi vào bài tập (chỉ dành cho teacher, manager, admin hoặc superadmin)
router.post('/:id/questions', authMiddleware.verifyRole(['teacher', 'manager', 'admin', 'superadmin']), exerciseController.addQuestionsToExercise);

// Lấy danh sách câu hỏi trong bài tập
router.get('/:id/questions', exerciseController.getQuestionsFromExercise);

// Nộp bài tập (chỉ dành cho người dùng đã đăng nhập)
router.post('/:id/submit', authMiddleware.verifyToken, exerciseController.submitExercise);

module.exports = router;

// exerciseRoutes.js
router.post('/', authMiddleware.verifyPermission('create_exercise'), exerciseController.createExercise);
