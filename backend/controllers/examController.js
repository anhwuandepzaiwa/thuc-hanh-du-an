const Exam = require('../models/Examination');

// Create Exam (Tạo kỳ thi)
exports.createExam = async (req, res) => {
    const { title, description, questionBank, questions, duration, totalMarks, passMarks, startDate, endDate, tags, visibility } = req.body;

    // Kiểm tra xem thông tin kỳ thi có đầy đủ không
    if (!title || !questionBank || !questions || !duration || !totalMarks || !passMarks || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Kiểm tra logic thời gian
    const now = new Date();
    if (new Date(startDate) < now) {
        return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }
    if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({ message: 'End date must be after start date.' });
    }

    try {
        const newExam = new Examination({
            title,
            description,
            questionBank,
            questions,
            duration,
            totalMarks,
            passMarks,
            createdBy: req.userId,  // Lấy userId từ middleware
            visibility: visibility || 'private',
            tags,
            startDate,
            endDate
        });

        await newExam.save();

        res.status(201).json({
            message: 'Exam created successfully!',
            exam: {
                id: newExam._id,
                title: newExam.title,
                startDate: newExam.startDate,
                endDate: newExam.endDate,
                duration: newExam.duration,
                totalMarks: newExam.totalMarks,
                passMarks: newExam.passMarks,
                visibility: newExam.visibility,
                tags: newExam.tags,
                createdAt: newExam.createdAt,
                updatedAt: newExam.updatedAt
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create exam', error: error.message });
    }
};


//Get All Exams (Lấy danh sách kỳ thi)
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find();
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exams', error: error.message });
    }
};

//Get Exam by ID (Lấy kỳ thi theo ID)
exports.getExamById = async (req, res) => {
    const { id } = req.params;

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exam', error: error.message });
    }
};

//Update Exam (Cập nhật kỳ thi)
exports.updateExam = async (req, res) => {
    const { id } = req.params;
    const { title, description, startDate, endDate, duration } = req.body;

    try {
        const exam = await Exam.findByIdAndUpdate(
            id,
            { title, description, startDate, endDate, duration },
            { new: true }
        );
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        
        res.status(200).json({ message: 'Exam updated successfully!', exam });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update exam', error: error.message });
    }
};

//Delete Exam (Xóa kỳ thi)
exports.deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        const exam = await Exam.findByIdAndDelete(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        res.status(200).json({ message: 'Exam deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam', error: error.message });
    }
};

//Add Questions to Exam (Thêm câu hỏi vào kỳ thi)
exports.addQuestionsToExam = async (req, res) => {
    const { id } = req.params;
    const { questions } = req.body; // Giả sử questions là một mảng ID câu hỏi

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        exam.questions.push(...questions); // Thêm câu hỏi vào kỳ thi
        await exam.save();

        res.status(200).json({ message: 'Questions added to exam successfully!', exam });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add questions', error: error.message });
    }
};

//Get Questions from Exam (Lấy câu hỏi từ kỳ thi)
exports.getQuestionsFromExam = async (req, res) => {
    const { id } = req.params;

    try {
        const exam = await Exam.findById(id).populate('questions'); // Giả sử bạn sử dụng populate để lấy thông tin câu hỏi
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }
        res.status(200).json(exam.questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get questions', error: error.message });
    }
};

//Start Exam (Bắt đầu kỳ thi)
exports.startExam = async (req, res) => {
    const { id } = req.params;

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        if (exam.status !== 'not_started') {
            return res.status(400).json({ message: 'Exam already started or completed.' });
        }

        exam.status = 'started';
        exam.startTime = Date.now();
        await exam.save();

        res.status(200).json({ message: 'Exam started successfully!', exam });
    } catch (error) {
        res.status(500).json({ message: 'Failed to start exam', error: error.message });
    }
};

//Submit Exam (Nộp bài thi)
exports.submitExam = async (req, res) => {
    const { id } = req.params;
    const { userId, answers } = req.body; // Giả sử bạn gửi một mảng câu trả lời

    try {
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Xử lý nộp bài thi (ví dụ: tính điểm, lưu kết quả)
        const score = calculateScore(exam.questions, answers); // Giả sử bạn có hàm calculateScore

        exam.submissions.push({ userId, answers, score });
        await exam.save();

        res.status(200).json({ message: 'Exam submitted successfully!', score });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit exam', error: error.message });
    }
};

// Giả sử bạn có hàm calculateScore để tính điểm cho bài thi
function calculateScore(questions, answers) {
    let score = 0;
    questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
            score += 1; // Cộng điểm cho mỗi câu trả lời đúng
        }
    });
    return score;
}
