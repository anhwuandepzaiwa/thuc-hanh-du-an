const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const Examination = require('../models/Examination');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation, typeId, bankId, difficulty, tags } = req.body;
    const createdBy = req.userId;

    // Kiểm tra dữ liệu nhập vào
    if (!questionText || !options || !correctAnswer || !typeId) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin câu hỏi.' });
    }

    try {
        // Tạo câu hỏi mới
        const newQuestion = new Question({
            questionText,
            options,
            correctAnswer,
            explanation,
            type: typeId,  // Kiểu câu hỏi
            bank: bankId || null,  // Nếu không có ngân hàng câu hỏi, sẽ gán là null
            difficulty: difficulty || 'medium', // Mức độ câu hỏi
            createdBy,     // Người tạo câu hỏi
            tags,
        });

        // Lưu câu hỏi vào cơ sở dữ liệu
        await newQuestion.save();
        res.status(201).json({ message: 'Câu hỏi đã được tạo thành công!', question: newQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Không thể tạo câu hỏi', error: error.message });
    }
};


// Get All Questions (Lấy tất cả câu hỏi)
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi không xác định', error: error.message });
    }
};

// Get Question by ID (Lấy câu hỏi theo ID)
exports.getQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy câu hỏi', error: error.message });
    }
};

// Update Question (Cập nhật câu hỏi)
exports.updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { questionText, options, correctAnswer, explanation, typeId, bankId, difficulty, tags } = req.body;
    const updateBy = req.userId;

    // Prepare the update data
    const updateData = {
        questionText,
        options,
        correctAnswer,
        explanation,
        type: typeId,  // Kiểu câu hỏi
        difficulty,    // Mức độ câu hỏi
        tags,          // Thẻ tags
        updateBy,      // Người cập nhật câu hỏi
    };

    // Conditionally add bankId if it is provided
    if (bankId) {
        updateData.bank = bankId;  // If bankId is provided, add it to the update data
    }

    try {
        // Perform the update
        const question = await Question.findByIdAndUpdate(id, updateData, { new: true });

        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        res.status(200).json({ message: 'Câu hỏi đã được cập nhật!', question });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật câu hỏi', error: error.message });
    }
};

// Delete Question (Xóa câu hỏi)
exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        res.status(200).json({ message: 'Câu hỏi đã được xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa câu hỏi', error: error.message });
    }
};

const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Cấu hình Multer để lưu tệp upload
const upload = multer({ dest: 'uploads/' });

// Hàm xử lý import file
exports.importQuestions = [
    upload.single('file'), // Chỉ chấp nhận một tệp
    async (req, res) => {
        try {
            // Check if the file was uploaded successfully
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const filePath = req.file.path;
            const entityId = req.params.id; // Lấy ID từ URL

            // Đọc file bằng thư viện XLSX
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Chuyển sheet sang JSON

            // Mảng lưu câu hỏi hợp lệ
            let validQuestions = [];

            // Duyệt qua từng dòng
            for (let row of data) {
                const { questionText, options, correctAnswer, explanation, difficulty, tags } = row;

                // Kiểm tra tính hợp lệ của dữ liệu
                if (!questionText || !options || !correctAnswer) {
                    continue;
                }

                // Tách các lựa chọn thành mảng
                const optionsArray = options.split(',').map(opt => opt.trim());
                if (optionsArray.length < 2) {
                    continue;
                }

                // Kiểm tra correctAnswer là chuỗi trước khi gọi trim()
                const formattedCorrectAnswer = typeof correctAnswer === 'string' ? correctAnswer.trim() : correctAnswer;

                // Tạo đối tượng câu hỏi
                const newQuestion = new Question({
                    questionText: questionText.trim(),
                    options: optionsArray,
                    correctAnswer: formattedCorrectAnswer,
                    explanation: explanation ? explanation.trim() : '',
                    difficulty: difficulty || 'medium',
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                });

                // Save the question to the database
                try {
                    const savedQuestion = await newQuestion.save();
                    validQuestions.push(savedQuestion._id); // Push the ObjectId of the saved question
                } catch (saveError) {
                    console.error(saveError.message);
                }
            }

            // Kiểm tra entityId và lưu câu hỏi vào Entity tương ứng (Question Bank, Examination, hoặc Exercise)
            if (validQuestions.length > 0) {
                try {
                    let entity;
                    if (req.body.type === 'questionBank') {
                        // Lưu câu hỏi vào Question Bank
                        entity = await QuestionBank.findByIdAndUpdate(entityId, { $push: { questions: { $each: validQuestions } } }, { new: true });
                    } else if (req.body.type === 'examination') {
                        // Lưu câu hỏi vào Examination
                        entity = await Examination.findByIdAndUpdate(entityId, { $push: { questions: { $each: validQuestions } } }, { new: true });
                    } else if (req.body.type === 'exercise') {
                        // Lưu câu hỏi vào Exercise
                        entity = await Exercise.findByIdAndUpdate(entityId, { $push: { questions: { $each: validQuestions } } }, { new: true });
                    } else {
                        return res.status(400).json({ message: 'Loại giá trị cung cấp không hợp lệ' });
                    }

                    if (entity) {
                        res.status(200).json({
                            message: `${validQuestions.length} câu hỏi được nhập thành công!`,
                            imported: validQuestions.length,
                        });
                    } else {
                        res.status(404).json({ message: `ID ${entityId} không được tìm thấy.` });
                    }
                } catch (dbError) {
                    res.status(500).json({ message: 'Lỗi nhập dữ liệu vào database', error: dbError.message });
                }
            } else {
                res.status(400).json({ message: 'Không có câu hỏi hợp lệ được tìm thấy.' });
            }
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Lỗi nhập câu hỏi', error: error.message });
        } finally {
            // Xóa file sau khi xử lý xong
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Lỗi xóa file:', err);
                });
            }
        }
    }
];




// Export Questions (Xuất câu hỏi)
exports.exportQuestions = async (req, res) => {
    try {
        const { id, type } = req.params; // Get ID and type from URL parameters
        
        let questions;

        // Fetch questions based on type and ID
        if (type === 'questionBank') {
            const questionBank = await QuestionBank.findById(id).populate('questions').lean();
            if (!questionBank) {
                return res.status(404).json({ message: 'Không tìm thấy ngân hàng câu hỏi' });
            }
            questions = questionBank.questions;
        } else if (type === 'examination') {
            const examination = await Examination.findById(id).populate('questions').lean();
            if (!examination) {
                return res.status(404).json({ message: 'Không tìm thấy kỳ thi' });
            }
            questions = examination.questions;
        } else if (type === 'exercise') {
            const exercise = await Exercise.findById(id).populate('questions').lean();
            if (!exercise) {
                return res.status(404).json({ message: 'Không tìm thấy bài tập' });
            }
            questions = exercise.questions;
        } else {
            return res.status(400).json({ message: 'Loại đầu vào không hợp lệ' });
        }

        // If no questions found, return a response
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi với id cung cấp' });
        }

        // Prepare data for export
        const data = questions.map((q) => {
            // Log each question for debugging
            console.log('Question:', q);
            
            return {
                QuestionText: q.questionText || 'No text',  // Default to 'No text' if undefined
                Options: Array.isArray(q.options) ? q.options.join(', ') : 'No options', // Join options or default to 'No options'
                CorrectAnswer: q.correctAnswer || 'No answer', // Provide fallback if undefined
                Explanation: q.explanation || 'No explanation', // Provide fallback for undefined explanation
                Difficulty: q.difficulty || 'medium', // Default to 'medium' if undefined
                Tags: Array.isArray(q.tags) ? q.tags.join(', ') : 'No tags', // Join tags or default to 'No tags'
                CreatedAt: q.createdAt ? q.createdAt.toISOString() : 'No date',
                UpdatedAt: q.updatedAt ? q.updatedAt.toISOString() : 'No date'
            };
        });

        // Create a new Excel workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

        // Create a unique file path with a timestamp
        const filePath = path.join(__dirname, `questions-${Date.now()}.xlsx`);
        
        // Write to file
        XLSX.writeFile(workbook, filePath);

        // Send the file as a download
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Lỗi xuất câu hỏi sang file Excel' });
            } else {
                // Remove the file after sending it
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Lỗi xóa file:', unlinkErr);
                });
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Lỗi xuất câu hỏi sang file Excel', error: error.message });
    }
};
