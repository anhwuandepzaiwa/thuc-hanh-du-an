const Examination = require('../models/Examination');
const QuestionBank = require('../models/QuestionBank');
const Registration = require('../models/Registration');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { ObjectId } = require('mongoose').Types;

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
        const exams = await Examination.find(filter).populate('questionBank', 'name').exec();

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
        const exam = await Examination.findById(id).populate('questions'); // Populate câu hỏi nếu câu hỏi là liên kết

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
    const { examId } = req.params; // Lấy ID của kỳ thi từ params
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

    try {
        // Kiểm tra examId hợp lệ
        if (!ObjectId.isValid(examId)) {
            return res.status(400).json({ message: 'Invalid exam ID.' });
        }

        // Kiểm tra questionBank hợp lệ
        if (!ObjectId.isValid(questionBank)) {
            return res.status(400).json({ message: 'Invalid question bank ID.' });
        }

        // Chuyển đổi questionBank sang ObjectId
        const questionBankId = new ObjectId(questionBank);

        // Chuyển đổi các câu hỏi (questions) thành cấu trúc hợp lệ
        const questionIds = questions.map(q => {
            if (!ObjectId.isValid(q.questionId)) {
                throw new Error(`Invalid question ID: ${q.questionId}`);
            }
            return {
                questionId: new ObjectId(q.questionId),
                marks: q.marks
            };
        });

        // Kiểm tra nếu ngân hàng câu hỏi không tồn tại
        const bankExists = await QuestionBank.findById(questionBankId);
        if (!bankExists) {
            return res.status(404).json({ message: 'Question bank not found.' });
        }

        // Cập nhật kỳ thi
        const updatedExam = await Examination.findByIdAndUpdate(
            examId,
            {
                title,
                description,
                questionBank: questionBankId,
                questions: questionIds, // Lưu cấu trúc questions đã được chuyển đổi
                duration,
                totalMarks,
                passMarks,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                tags,
                visibility
            },
            { new: true } // Trả về document đã cập nhật
        );

        if (!updatedExam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        res.status(200).json({
            message: 'Exam updated successfully!',
            exam: updatedExam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update exam',
            error: error.message
        });
    }
};



// Xóa kỳ thi
exports.deleteExam = async (req, res) => {
    const { id } = req.params;

    try {
        // Tìm kỳ thi theo id
        const exam = await Examination.findById(id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Xóa kỳ thi
        await Examination.findByIdAndDelete(id);

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
        const exam = await Examination.findById(examId);
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
        const exam = await Examination.findById(examId)
            .populate('questions.questionId', 'questionText options marks');  // Exclude correctAnswer and explanation, include options

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

        // Gửi thông tin kỳ thi và câu hỏi cho người dùng
        res.status(200).json({
            message: 'Exam has started!',
            exam: {
                id: exam._id,
                title: exam.title,
                description: exam.description,
                startDate: exam.startDate,
                endDate: exam.endDate,
                duration: exam.duration,
                questions: exam.questions.map(q => ({
                    questionId: q.questionId,  // Only include questionId
                    marks: q.marks  // Include marks
                    // options will be included within questionId
                })),
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to start the exam', error: error.message });
    }
};

// Nộp bài thi
exports.submitExam = async (req, res) => {
    const { examId } = req.params;  // ID kỳ thi từ URL
    const userId = req.userId;      // userId từ middleware xác thực
    const answers = req.body.answers;  // Dữ liệu câu trả lời từ body request

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Examination.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Kiểm tra xem người dùng đã đăng ký tham gia kỳ thi này chưa
        const registration = await Registration.findOne({ user: userId, exam: examId });
        if (!registration) {
            return res.status(400).json({ message: 'You are not registered for this exam.' });
        }

        // Kiểm tra xem người dùng đã nộp bài thi chưa
        if (registration.status === 'completed') {
            return res.status(400).json({ message: 'You have already submitted the exam.' });
        }

        // Lưu câu trả lời của người dùng và kiểm tra đáp án đúng/sai
        const answerPromises = answers.map(async (answer) => {
            const { questionId, answerText } = answer;

            // Lấy câu hỏi để kiểm tra đáp án
            const question = await Question.findById(questionId);
            const isCorrect = question.correctAnswer === answerText;

            const newAnswer = new Answer({
                userId,
                examId,
                questionId,
                answer: answerText,
                isCorrect,  // Lưu giá trị isCorrect
            });
            await newAnswer.save();
        });

        // Chờ tất cả câu trả lời được lưu
        await Promise.all(answerPromises);

        // Tính điểm sau khi nộp bài
        const score = await calculateResults(userId, examId);

        // Cập nhật điểm cho kỳ thi
        registration.score = score;
        registration.status = 'completed';
        await registration.save();

        res.status(200).json({ message: 'Exam submitted successfully.', score });
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
        const exam = await Examination.findById(examId);
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

        // Tính điểm cho kỳ thi của người dùng dựa vào marks của từng câu hỏi
        let score = 0;
        for (let answer of answers) {
            const question = await Question.findById(answer.questionId);
            if (question && question.correctAnswer === answer.answer) {
                // Cộng điểm cho mỗi câu trả lời đúng
                const questionDetails = exam.questions.find(q => q.questionId.toString() === question._id.toString());
                score += questionDetails.marks;  // Cộng điểm của câu hỏi
            }
        }

        // Trả về kết quả thi
        res.status(200).json({
            message: 'Exam results retrieved successfully.',
            result: {
                examId: exam._id,
                userId: userId,
                score: score,  // Điểm thi của người dùng
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


exports.getExamStatistics = async (req, res) => {
    const { examId } = req.params;  // Lấy ID kỳ thi từ URL

    try {
        // Kiểm tra xem kỳ thi có tồn tại không
        const exam = await Examination.findById(examId);
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

        // Tính điểm cho từng người và tổng điểm
        const totalScores = {};
        for (let userId of completedUserIds) {
            const score = await calculateResults(userId, examId);
            totalScores[userId] = score;
        }

        console.log("Total Scores: ", totalScores);  // Log điểm của từng người

        // Tính điểm trung bình
        const totalScore = Object.values(totalScores).reduce((acc, score) => acc + score, 0);
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

async function calculateResults(userId, examId) {
    // Lấy tất cả câu trả lời của học sinh
    const answers = await Answer.find({ userId, examId });

    // Lấy thông tin kỳ thi và các câu hỏi trong kỳ thi
    const exam = await Examination.findById(examId).populate('questions.questionId'); // Populate để lấy câu hỏi

    let score = 0;

    // Duyệt qua tất cả câu trả lời của học sinh
    answers.forEach(answer => {
        // Tìm câu hỏi tương ứng với câu trả lời
        const question = exam.questions.find(q => q.questionId._id.toString() === answer.questionId.toString());

        // Nếu câu hỏi tồn tại và câu trả lời đúng
        if (question) {
            // So sánh câu trả lời với câu trả lời đúng trong câu hỏi
            if (question.questionId.correctAnswer === answer.answer) {
                score += question.marks; // Cộng điểm theo marks của câu hỏi
            }
        }
    });

    return score;
}

exports.addQuestionsToExam = async (req, res) => {
    try {
        const { examId, questions } = req.body;  // Expecting an array of question objects with questionId and marks

        // Check if the exam exists
        const exam = await Examination.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Loop through each question and validate the data
        for (let question of questions) {
            if (!question.questionId || !question.marks) {
                return res.status(400).json({ message: 'Both questionId and marks are required for each question.' });
            }

            // Check if the questionId exists in the Question collection
            const questionExists = await Question.findById(question.questionId);
            if (!questionExists) {
                return res.status(400).json({ message: `Question with ID ${question.questionId} does not exist.` });
            }

            // Check if the question is already in the exam
            if (!exam.questions.some(q => q.questionId.toString() === question.questionId.toString())) {
                exam.questions.push({
                    questionId: question.questionId,
                    marks: question.marks
                });
            }
        }

        // Save the updated exam
        await exam.save();

        res.status(200).json({ message: 'Exam updated successfully!', exam });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};

exports.getQuestionsFromExam = async (req, res) => {
    try {
        const { examId } = req.params;  // Get examId from the URL parameter

        // Check if the exam exists
        const exam = await Examination.findById(examId).populate('questions.questionId');
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found.' });
        }

        // Return the questions from the exam
        res.status(200).json({
            message: 'Questions fetched successfully.',
            questions: exam.questions.map(q => ({
                questionId: q.questionId,
                marks: q.marks
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
};


