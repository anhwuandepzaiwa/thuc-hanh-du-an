const Exercise = require('../models/Exercise');
const Submission = require('../models/Submission');
// Create Exercise (Tạo bài tập mới)
exports.createExercise = async (req, res) => {
    const { title, description, dueDate, fileTypeAllowed } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!title || !dueDate || !fileTypeAllowed || fileTypeAllowed.length === 0) {
        return res.status(400).json({ message: 'Title, due date, and file type allowed are required.' });
    }

    try {
        // Tạo bài tập mới
        const newExercise = new Exercise({
            title,
            description,
            dueDate,
            fileTypeAllowed,
            createdBy: req.userId,  // Giả sử user đã đăng nhập và có _id
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
    const { visibility, dueDate, createdBy } = req.query;

    try {
        // Xây dựng các điều kiện tìm kiếm động
        const filter = {};

        // Bộ lọc theo tính năng hiển thị (visibility)
        if (visibility) {
            filter.visibility = visibility;
        }

        // Bộ lọc theo ngày hết hạn (dueDate) - có thể so sánh với ngày hiện tại
        if (dueDate) {
            filter.dueDate = { $lte: new Date(dueDate) }; // Tìm bài tập có ngày hết hạn nhỏ hơn hoặc bằng dueDate
        }

        // Bộ lọc theo người tạo bài tập (createdBy)
        if (createdBy) {
            filter.createdBy = createdBy;  // Tìm bài tập theo người tạo
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
    const { title, description, dueDate, fileTypeAllowed, visibility } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!title || !dueDate || !fileTypeAllowed) {
        return res.status(400).json({ message: 'Title, due date, and file types allowed are required.' });
    }

    try {
        // Xây dựng đối tượng cập nhật
        const updatedData = {
            title,
            description,
            dueDate,
            fileTypeAllowed,    // Các loại tệp được phép nộp
            visibility          // Trạng thái bài tập: public hoặc private
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
    const file = req.file; // Tệp bài nộp từ request

    // Kiểm tra xem tệp đã được gửi chưa
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        // Tìm bài tập theo ID
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found.' });
        }

        // Tạo bản ghi nộp bài
        const submission = {
            exerciseId: id,
            studentId: req.userId, // ID của sinh viên (giả sử thông qua middleware xác thực người dùng)
            file: file.path, // Đường dẫn đến tệp đã tải lên
            submissionDate: Date.now()
        };

        // Lưu thông tin nộp bài vào cơ sở dữ liệu
        const newSubmission = new Submission(submission);
        await newSubmission.save();

        // Trả về phản hồi thành công
        res.status(200).json({ message: 'File submitted successfully!', submission: newSubmission });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit exercise', error: error.message });
    }
};

exports.getStudentSubmissions = async (req, res) => {
    const { id } = req.params; // ID của bài tập
    const studentId = req.userId; // ID sinh viên từ token (middleware xác thực)

    try {
        // Tìm bài nộp của sinh viên cho bài tập cụ thể
        const submission = await Submission.findOne({
            exerciseId: id,
            studentId: studentId
        });

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this exercise by the student.' });
        }

        // Trả về thông tin bài nộp
        res.status(200).json({
            submissionId: submission._id,
            userId: submission.studentId,
            file: submission.file,
            submittedAt: submission.submissionDate
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
    }
};

exports.gradeSubmission = async (req, res) => {
    const { id, submissionId } = req.params; // ID bài tập và bài nộp
    const { grade } = req.body; // Điểm chấm từ body

    // Kiểm tra dữ liệu đầu vào
    if (typeof grade !== 'number' || grade < 0 || grade > 10) {
        return res.status(400).json({ message: 'Invalid grade. Grade must be a number between 0 and 10.' });
    }

    try {
        // Tìm bài nộp theo ID bài tập và bài nộp
        const submission = await Submission.findOne({
            _id: submissionId,
            exerciseId: id
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        // Cập nhật điểm cho bài nộp
        submission.grade = grade;
        await submission.save();

        // Trả về thông báo thành công
        res.status(200).json({
            message: 'Submission graded successfully!',
            submission: {
                submissionId: submission._id,
                studentId: submission.studentId,
                grade: submission.grade,
                gradedAt: submission.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to grade submission', error: error.message });
    }
};

exports.getSubmissionGrade = async (req, res) => {
    const { id, submissionId } = req.params; // ID bài tập và bài nộp

    try {
        // Tìm bài nộp theo ID bài tập và bài nộp
        const submission = await Submission.findOne({
            _id: submissionId,
            exerciseId: id
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }

        // Kiểm tra nếu bài nộp chưa được chấm điểm
        if (submission.grade === undefined) {
            return res.status(200).json({ message: 'This submission has not been graded yet.' });
        }

        // Trả về điểm và nhận xét
        res.status(200).json({
            grade: submission.grade,
            feedback: submission.feedback || 'No feedback provided.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submission grade', error: error.message });
    }
};