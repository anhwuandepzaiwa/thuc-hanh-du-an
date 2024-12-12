const Exam = require('../models/Examination');
const QuestionBank = require('../models/QuestionBank');
const Registration = require('../models/Registration');
const Answer = require('../models/Answer');

// Tạo kỳ thi
exports.createExam = async (req, res) => {
    const { 
        title, 
        description, 
        questionBank, 
        questions, 
        duration, 
        totalMarks, 
        passMarks, 
        startDate, 
        endDate, 
        tags, 
        visibility 
    } = req.body;

    // Kiểm tra xem thông tin kỳ thi có đầy đủ không
    if (!title || !questionBank || !questions || !duration || !totalMarks || !passMarks || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Kiểm tra nếu startDate và endDate là kiểu Date hợp lệ
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid start date format.' });
    }
    if (isNaN(endDateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format.' });
    }

    // Kiểm tra logic thời gian
    const now = new Date();
    if (startDateObj < now) {
        return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }
    if (startDateObj >= endDateObj) {
        return res.status(400).json({ message: 'End date must be after start date.' });
    }

    try {
        // Kiểm tra xem ngân hàng câu hỏi có tồn tại
        const bankExists = await QuestionBank.findById(questionBank);
        if (!bankExists) {
            return res.status(404).json({ message: 'Question bank not found.' });
        }

        // Tạo kỳ thi mới
        const newExam = new Examination({
            title,
            description,
            questionBank,
            questions,
            duration,
            totalMarks,
            passMarks,
            createdBy: req.userId,  // Lấy userId từ middleware
            visibility: visibility || 'private',  // Mặc định là 'private' nếu không có
            tags: tags || [],  // Nếu không có tags, gán mảng rỗng
            startDate: startDateObj,
            endDate: endDateObj
        });

        // Lưu kỳ thi vào cơ sở dữ liệu
        await newExam.save();

        // Trả về kết quả thành công
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
        // Xử lý lỗi nếu có
        res.status(500).json({ message: 'Failed to create exam', error: error.message });
    }
};


exports.getAllExams = async (req, res) => {
    try {
        // Lấy bộ lọc từ query parameters trong URL
        const { title, subject, startDate, endDate, visibility } = req.query;

        // Tạo một đối tượng điều kiện truy vấn (filter)
        const filter = {};

        // Nếu có bộ lọc theo tên kỳ thi (title)
        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa, chữ thường
        }

        // Nếu có bộ lọc theo môn học (subject) hoặc ngân hàng câu hỏi liên quan đến môn học
        if (subject) {
            filter.subject = { $regex: subject, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa, chữ thường
        }

        // Nếu có bộ lọc theo ngày bắt đầu kỳ thi (startDate)
        if (startDate) {
            filter.startDate = { $gte: new Date(startDate) }; // Tìm kỳ thi bắt đầu từ ngày này trở đi
        }

        // Nếu có bộ lọc theo ngày kết thúc kỳ thi (endDate)
        if (endDate) {
            filter.endDate = { $lte: new Date(endDate) }; // Tìm kỳ thi kết thúc đến ngày này
        }

        // Nếu có bộ lọc theo trạng thái của kỳ thi (visibility)
        if (visibility) {
            filter.visibility = visibility;
        }

        // Tìm tất cả kỳ thi thỏa mãn các điều kiện đã lọc
        const exams = await Exam.find(filter).populate('questionBank', 'name').exec();

        // Nếu không có kỳ thi nào thỏa mãn, trả về thông báo
        if (exams.length === 0) {
            return res.status(404).json({ message: 'No exams found with the provided filters.' });
        }

        // Trả về danh sách kỳ thi
        res.status(200).json(exams);

    } catch (error) {
        // Nếu có lỗi xảy ra trong quá trình truy vấn, trả về lỗi
        res.status(500).json({ message: 'Failed to get exams', error: error.message });
    }
};


// Lấy chi tiết kỳ thi theo ID
exports.getExamById = async (req, res) => {
    const { id } = req.params;

    try {
        // Tìm kỳ thi theo ID
        const exam = await Exam.findById(id).populate('questions'); // Populate câu hỏi nếu câu hỏi là liên kết

        // Nếu không tìm thấy kỳ thi
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Trả về thông tin kỳ thi chi tiết
        res.status(200).json({
            id: exam._id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            passMarks: exam.passMarks,
            startDate: exam.startDate,
            endDate: exam.endDate,
            status: exam.status,  // Thêm trạng thái kỳ thi nếu có
            visibility: exam.visibility,
            tags: exam.tags,
            questions: exam.questions, // Danh sách câu hỏi liên quan
            createdAt: exam.createdAt,
            updatedAt: exam.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get exam', error: error.message });
    }
};

// Cập nhật kỳ thi
exports.updateExam = async (req, res) => {
    const { id } = req.params;
    const { title, description, startDate, endDate, duration, questions, visibility } = req.body;

    try {
        // Kiểm tra xem kỳ thi có tồn tại hay không
        const exam = await Exam.findById(id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Cập nhật thông tin kỳ thi
        exam.title = title || exam.title;
        exam.description = description || exam.description;
        exam.startDate = startDate || exam.startDate;
        exam.endDate = endDate || exam.endDate;
        exam.duration = duration || exam.duration;
        exam.questions = questions || exam.questions; // Cập nhật danh sách câu hỏi (nếu có)
        exam.visibility = visibility || exam.visibility; // Cập nhật trạng thái kỳ thi (public/private)

        // Kiểm tra logic thời gian (optional, tuỳ vào yêu cầu)
        const now = new Date();
        if (new Date(exam.startDate) < now) {
            return res.status(400).json({ message: 'Start date cannot be in the past.' });
        }
        if (new Date(exam.startDate) >= new Date(exam.endDate)) {
            return res.status(400).json({ message: 'End date must be after start date.' });
        }

        // Lưu các thay đổi
        await exam.save();

        // Trả về kết quả
        res.status(200).json({
            message: 'Exam updated successfully!',
            exam: {
                id: exam._id,
                title: exam.title,
                description: exam.description,
                startDate: exam.startDate,
                endDate: exam.endDate,
                duration: exam.duration,
                questions: exam.questions,
                visibility: exam.visibility,
                createdAt: exam.createdAt,
                updatedAt: exam.updatedAt
            },
        });

    } catch (error) {
        // Xử lý lỗi
        res.status(500).json({ message: 'Failed to update exam', error: error.message });
    }
};

// Xóa kỳ thi
exports.deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra quyền nếu cần (ví dụ: chỉ người tạo hoặc admin mới có quyền xóa kỳ thi)
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra nếu người dùng có quyền xóa (giả sử req.userId là ID của người dùng hiện tại)
        if (exam.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this exam.' });
        }

        // Xóa kỳ thi
        await Exam.findByIdAndDelete(id);

        res.status(200).json({ message: 'Exam deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam', error: error.message });
    }
};

// Đăng ký tham gia kỳ thi
exports.registerForExam = async (req, res) => {
    const { examId } = req.params; // Lấy ID kỳ thi từ URL
    const userId = req.userId; // Lấy userId từ middleware xác thực (có thể dùng JWT hoặc session)

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem kỳ thi đã bắt đầu chưa và còn thời gian để đăng ký
        const now = new Date();
        if (new Date(exam.startDate) < now) {
            return res.status(400).json({ message: 'The exam has already started.' });
        }

        // Kiểm tra xem người dùng đã đăng ký kỳ thi này chưa
        const existingRegistration = await Registration.findOne({ user: userId, exam: examId });
        if (existingRegistration) {
            return res.status(400).json({ message: 'You have already registered for this exam.' });
        }

        // Tạo đăng ký mới cho người dùng
        const registration = new Registration({
            user: userId,
            exam: examId,
        });

        await registration.save();

        res.status(201).json({
            message: 'Registration successful!',
            registration: {
                id: registration._id,
                userId: registration.user,
                examId: registration.exam,
                registrationDate: registration.registrationDate,
                status: registration.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register for exam', error: error.message });
    }
};

// Bắt đầu kỳ thi
exports.startExam = async (req, res) => {
    const { examId } = req.params; // Lấy ID kỳ thi từ URL
    const userId = req.userId; // Lấy userId từ middleware xác thực (JWT hoặc session)

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem người dùng đã đăng ký kỳ thi này chưa
        const registration = await Registration.findOne({ user: userId, exam: examId });
        if (!registration) {
            return res.status(400).json({ message: 'You are not registered for this exam.' });
        }

        // Kiểm tra xem kỳ thi đã bắt đầu chưa
        const now = new Date();
        if (new Date(exam.startDate) > now) {
            return res.status(400).json({ message: 'The exam has not started yet.' });
        }

        // Kiểm tra xem kỳ thi đã kết thúc chưa
        if (new Date(exam.endDate) < now) {
            return res.status(400).json({ message: 'The exam has already ended.' });
        }

        // Cập nhật trạng thái người dùng, nếu cần
        registration.status = 'started';  // Trạng thái đăng ký được thay đổi thành 'started'
        await registration.save();

        // Gửi thông tin kỳ thi cho người dùng
        res.status(200).json({
            message: 'Exam has started!',
            exam: {
                id: exam._id,
                title: exam.title,
                description: exam.description,
                startDate: exam.startDate,
                endDate: exam.endDate,
                duration: exam.duration,
                questions: exam.questions,  // Cung cấp danh sách câu hỏi nếu cần
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to start the exam', error: error.message });
    }
};

// Kết thúc kỳ thi
exports.endExam = async (req, res) => {
    const { examId } = req.params; // Lấy ID kỳ thi từ URL
    const userId = req.userId; // Lấy userId từ middleware xác thực (JWT hoặc session)

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem người dùng có tham gia kỳ thi không
        const registration = await Registration.findOne({ user: userId, exam: examId });
        if (!registration) {
            return res.status(400).json({ message: 'You are not registered for this exam.' });
        }

        // Kiểm tra thời gian kết thúc kỳ thi
        const now = new Date();
        if (new Date(exam.endDate) > now && registration.status !== 'completed') {
            return res.status(400).json({ message: 'The exam time has not yet ended or you have not completed the exam.' });
        }

        // Nếu người dùng đã hoàn thành bài thi
        if (registration.status !== 'completed') {
            // Cập nhật trạng thái người dùng là 'completed'
            registration.status = 'completed';
            await registration.save();
        }

        // Cập nhật trạng thái kỳ thi là 'ended'
        exam.status = 'ended';
        await exam.save();

        // Tính điểm (tuỳ vào cách tính điểm của bạn)
        // Giả sử có một hàm calculateResults để tính điểm người dùng
        const score = await calculateResults(userId, examId); // Tính điểm cho người dùng

        // Gửi kết quả cho người dùng
        res.status(200).json({
            message: 'Exam ended successfully!',
            result: {
                examId: exam._id,
                score: score,
                totalMarks: exam.totalMarks,
                status: 'completed',
                completedAt: now
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to end the exam', error: error.message });
    }
};

// Nộp bài thi
exports.submitExam = async (req, res) => {
    const { examId } = req.params;  // ID kỳ thi từ URL
    const userId = req.userId;      // userId từ middleware xác thực
    const answers = req.body.answers;  // Dữ liệu câu trả lời từ body request

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem người dùng đã đăng ký tham gia kỳ thi này chưa
        const registration = await Registration.findOne({ user: userId, exam: examId });
        if (!registration) {
            return res.status(400).json({ message: 'You are not registered for this exam.' });
        }

        // Lưu câu trả lời của người dùng
        const answerPromises = answers.map(async (answer) => {
            const { questionId, answerText, isCorrect } = answer;
            const newAnswer = new Answer({
                userId,
                examId,
                questionId,
                answer: answerText,
                isCorrect,
            });
            await newAnswer.save();
        });

        // Chờ tất cả câu trả lời được lưu
        await Promise.all(answerPromises);

        // Cập nhật trạng thái kỳ thi là đã nộp bài
        registration.status = 'completed';
        await registration.save();

        res.status(200).json({ message: 'Exam submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit exam', error: error.message });
    }
};

// Lấy kết quả thi của người dùng
exports.getExamResults = async (req, res) => {
    const { examId } = req.params;  // Lấy ID kỳ thi từ URL
    const userId = req.userId;      // Lấy userId từ middleware xác thực

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem người dùng có đăng ký tham gia kỳ thi này không
        const registration = await Registration.findOne({ user: userId, exam: examId });
        if (!registration) {
            return res.status(400).json({ message: 'You are not registered for this exam.' });
        }

        // Kiểm tra xem người dùng đã hoàn thành kỳ thi chưa
        if (registration.status !== 'completed') {
            return res.status(400).json({ message: 'You have not completed the exam yet.' });
        }

        // Lấy câu trả lời của người dùng từ bảng Answer
        const answers = await Answer.find({ userId, examId });

        // Tính điểm cho kỳ thi của người dùng
        const score = answers.filter(answer => answer.isCorrect).length;
        
        // Trả về kết quả thi
        res.status(200).json({
            message: 'Exam results retrieved successfully.',
            result: {
                examId: exam._id,
                userId: userId,
                score: score,  // Số câu trả lời đúng
                totalMarks: exam.totalMarks,
                status: registration.status,
                answers: answers, // Các câu trả lời của người dùng
                submittedAt: registration.updatedAt // Thời gian nộp bài
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve exam results', error: error.message });
    }
};

// Thống kê kỳ thi
exports.getExamStatistics = async (req, res) => {
    const { examId } = req.params;  // Lấy ID kỳ thi từ URL

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Lấy tất cả người dùng đã đăng ký tham gia kỳ thi
        const registrations = await Registration.find({ exam: examId });

        // Lấy câu trả lời của tất cả người dùng đã hoàn thành kỳ thi
        const completedRegistrations = await Registration.find({ exam: examId, status: 'completed' });
        const completedUserIds = completedRegistrations.map(reg => reg.user.toString());

        // Tỷ lệ hoàn thành: Số người hoàn thành / Số người đăng ký
        const completionRate = (completedRegistrations.length / registrations.length) * 100;

        // Lấy câu trả lời của tất cả người dùng đã hoàn thành kỳ thi
        const answers = await Answer.find({ examId, userId: { $in: completedUserIds } });

        // Tính số điểm trung bình
        const totalScore = answers.reduce((acc, answer) => acc + (answer.isCorrect ? 1 : 0), 0);
        const averageScore = totalScore / completedRegistrations.length;

        // Số người tham gia
        const totalParticipants = registrations.length;

        // Trả về thống kê kỳ thi
        res.status(200).json({
            message: 'Exam statistics retrieved successfully.',
            statistics: {
                examId: exam._id,
                completionRate: completionRate.toFixed(2),  // Tỷ lệ hoàn thành (%)
                averageScore: averageScore.toFixed(2),      // Điểm trung bình
                totalParticipants: totalParticipants        // Tổng số người tham gia
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve exam statistics', error: error.message });
    }
};


// Giả sử có hàm calculateResults để tính điểm người dùng
async function calculateResults(userId, examId) {
    // Tính toán kết quả dựa trên câu trả lời của người dùng
    // Đây chỉ là ví dụ đơn giản, bạn có thể tính điểm theo cách khác tùy vào cấu trúc kỳ thi
    const answers = await Answer.find({ user: userId, exam: examId });
    let score = 0;
    
    answers.forEach(answer => {
        if (answer.isCorrect) { // Giả sử isCorrect là trường xác định câu trả lời đúng
            score += 1; // Tính điểm cho câu trả lời đúng
        }
    });

    return score;
}


