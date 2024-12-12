const Exercise = require('../models/Exercise');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Create Exercise (Tạo bài tập mới)
exports.createExercise = async (req, res) => {
    const { title, description, subject, difficulty, dueDate, questions, duration, totalMarks } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !subject || !difficulty || !dueDate || !questions || questions.length === 0 || !duration || !totalMarks) {
        return res.status(400).json({ message: 'Title, subject, difficulty, due date, questions, duration, and total marks are required.' });
    }

    try {
        // Tạo bài tập mới
        const newExercise = new Exercise({
            title,
            description,
            subject,
            difficulty,
            questions,
            duration,
            totalMarks,
            createdBy: req.user._id,  // Giả sử user đã đăng nhập và có _id
            status: 'not_started', // Bài tập chưa bắt đầu
            visibility: 'private'  // Mặc định là riêng tư
        });

        // Lưu bài tập vào cơ sở dữ liệu
        await newExercise.save();

        // Trả về thông báo thành công
        res.status(201).json({ message: 'Exercise created successfully!', exercise: newExercise });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exercise', error: error.message });
    }
};


// Get All Exercises (Lấy danh sách tất cả bài tập)
exports.getAllExercises = async (req, res) => {
    // Lấy các bộ lọc từ query params
    const { subject, difficulty, status } = req.query;

    try {
        // Xây dựng các điều kiện tìm kiếm động
        const filter = {};

        if (subject) {
            filter.subject = subject;  // Bộ lọc theo môn học
        }

        if (difficulty) {
            filter.difficulty = difficulty;  // Bộ lọc theo mức độ khó
        }

        if (status) {
            filter.status = status;  // Bộ lọc theo trạng thái bài tập
        }

        // Tìm bài tập theo bộ lọc
        const exercises = await Exercise.find(filter);

        // Nếu không có bài tập nào, trả về thông báo
        if (exercises.length === 0) {
            return res.status(404).json({ message: 'No exercises found for the given filters.' });
        }

        // Trả về danh sách bài tập
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exercises', error: error.message });
    }
};


// Get Exercise by ID (Lấy bài tập theo ID)
exports.getExerciseById = async (req, res) => {
    const { id } = req.params;  // Lấy ID bài tập từ tham số URL

    try {
        // Tìm bài tập theo ID
        const exercise = await Exercise.findById(id);
        
        // Nếu bài tập không tìm thấy, trả về lỗi
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        // Trả về chi tiết bài tập
        res.status(200).json(exercise);
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: 'Failed to get exercise', error: error.message });
    }
};

// Update Exercise (Cập nhật bài tập)
exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, status, questions, difficulty, tags } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!title || !dueDate) {
        return res.status(400).json({ message: 'Title and due date are required.' });
    }

    try {
        // Xây dựng đối tượng cập nhật
        const updatedData = {
            title,
            description,
            dueDate,
            status,            // Trạng thái bài tập (ví dụ: "not_started", "in_progress", "completed")
            questions,         // Cập nhật câu hỏi
            difficulty,        // Mức độ khó bài tập
            tags               // Các thẻ liên quan
        };

        // Xóa các trường có giá trị undefined hoặc null
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined || updatedData[key] === null) {
                delete updatedData[key];
            }
        });

        // Tìm và cập nhật bài tập
        const exercise = await Exercise.findByIdAndUpdate(id, updatedData, { new: true });

        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        // Trả về bài tập đã cập nhật
        res.status(200).json({ message: 'Exercise updated successfully!', exercise });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update exercise', error: error.message });
    }
};


// Delete Exercise (Xóa bài tập)
exports.deleteExercise = async (req, res) => {
    const { id } = req.params;  // Lấy ID bài tập từ tham số URL

    try {
        // Tìm bài tập theo ID và xóa nó khỏi cơ sở dữ liệu
        const exercise = await Exercise.findByIdAndDelete(id);
        
        // Nếu bài tập không tìm thấy, trả về lỗi
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        // Trả về thông báo thành công
        res.status(200).json({ message: 'Exercise deleted successfully!' });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: 'Failed to delete exercise', error: error.message });
    }
};

// Học sinh thực hiện bài tập
exports.submitAnswers = async (req, res) => {
    const { examId, answers } = req.body; // `answers` là danh sách câu trả lời của học sinh
    const userId = req.user.id; // ID của học sinh (lấy từ session hoặc token)

    if (!examId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Exam ID and answers are required.' });
    }

    try {
        const results = [];

        for (const ans of answers) {
            const { questionId, answer } = ans;

            // Tìm câu hỏi và kiểm tra đáp án đúng
            const question = await Question.findById(questionId);
            if (!question) {
                results.push({ questionId, success: false, message: 'Question not found.' });
                continue;
            }

            const isCorrect = question.correctAnswer === answer;

            // Lưu câu trả lời vào bảng Answer
            const newAnswer = new Answer({
                userId,
                examId,
                questionId,
                answer,
                isCorrect,
            });
            await newAnswer.save();

            results.push({ questionId, success: true, isCorrect });
        }

        res.status(200).json({
            message: 'Answers submitted successfully!',
            results,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit answers', error: error.message });
    }
};

// Add Questions to Exercise (Thêm câu hỏi vào bài tập)
exports.addQuestionsToExercise = async (req, res) => {
    const { id } = req.params;
    const { questions } = req.body; // Giả sử questions là một mảng ID câu hỏi

    try {
        const exercise = await Exercise.findById(id);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        exercise.questions.push(...questions); // Thêm câu hỏi vào bài tập
        await exercise.save();

        res.status(200).json({ message: 'Questions added to exercise successfully!', exercise });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add questions', error: error.message });
    }
};

// Get Questions from Exercise (Lấy câu hỏi từ bài tập)
exports.getQuestionsFromExercise = async (req, res) => {
    const { id } = req.params;

    try {
        const exercise = await Exercise.findById(id).populate('questions'); // Giả sử bạn sử dụng populate để lấy thông tin câu hỏi
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }
        res.status(200).json(exercise.questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get questions', error: error.message });
    }
};

//Submit Exercise (Nộp bài tập)
exports.submitExercise = async (req, res) => {
    const { id } = req.params;
    const { userId, answers } = req.body; // Giả sử bạn gửi một mảng câu trả lời

    try {
        const exercise = await Exercise.findById(id);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        // Xử lý nộp bài tập (ví dụ: tính điểm, lưu kết quả)
        const score = calculateScore(exercise.questions, answers); // Giả sử bạn có hàm calculateScore

        exercise.submissions.push({ userId, answers, score });
        await exercise.save();

        res.status(200).json({ message: 'Exercise submitted successfully!', score });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit exercise', error: error.message });
    }
};

// Giả sử bạn có hàm calculateScore để tính điểm cho bài tập
function calculateScore(questions, answers) {
    let score = 0;
    questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
            score += 1; // Cộng điểm cho mỗi câu trả lời đúng
        }
    });
    return score;
}
