const Exercise = require('../models/Exercise');

// Create Exercise (Tạo bài tập mới)
exports.createExercise = async (req, res) => {
    const { title, description, dueDate } = req.body;

    if (!title || !dueDate) {
        return res.status(400).json({ message: 'Title and due date are required.' });
    }

    try {
        const newExercise = new Exercise({
            title,
            description,
            dueDate,
            status: 'not_started' // Bài tập chưa bắt đầu
        });

        await newExercise.save();
        res.status(201).json({ message: 'Exercise created successfully!', exercise: newExercise });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exercise', error: error.message });
    }
};

// Get All Exercises (Lấy danh sách tất cả bài tập)
exports.getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.status(200).json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exercises', error: error.message });
    }
};

// Get Exercise by ID (Lấy bài tập theo ID)
exports.getExerciseById = async (req, res) => {
    const { id } = req.params;

    try {
        const exercise = await Exercise.findById(id);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }
        res.status(200).json(exercise);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exercise', error: error.message });
    }
};

// Update Exercise (Cập nhật bài tập)
exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    try {
        const exercise = await Exercise.findByIdAndUpdate(
            id,
            { title, description, dueDate },
            { new: true }
        );

        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        res.status(200).json({ message: 'Exercise updated successfully!', exercise });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update exercise', error: error.message });
    }
};

// Delete Exercise (Xóa bài tập)
exports.deleteExercise = async (req, res) => {
    const { id } = req.params;

    try {
        const exercise = await Exercise.findByIdAndDelete(id);
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        res.status(200).json({ message: 'Exercise deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exercise', error: error.message });
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
