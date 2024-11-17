const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const QuestionType = require('../models/QuestionType');
const User = require('../models/User');

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
    const { questionText, options, correctAnswer, explanation, typeId, bankId, difficulty, tags } = req.body;
    const createdBy = req.userId;
    // Kiểm tra dữ liệu nhập vào
    if (!questionText || !options || !correctAnswer || !typeId || !bankId) {
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
            bank: bankId,  // Ngân hàng câu hỏi
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
        res.status(500).json({ message: 'Failed to get questions', error: error.message });
    }
};

// Get Question by ID (Lấy câu hỏi theo ID)
exports.getQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get question', error: error.message });
    }
};

// Update Question (Cập nhật câu hỏi)
exports.updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { questionText, options, correctAnswer, explanation, typeId, bankId, difficulty, tags } = req.body; 
    const updateBy = req.userId;
    try {
        const question = await Question.findByIdAndUpdate(
            id,
            { questionText, options, correctAnswer, explanation, typeId, bankId, difficulty, tags, updateBy},
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.status(200).json({ message: 'Question updated successfully!', question });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update question', error: error.message });
    }
};

// Delete Question (Xóa câu hỏi)
exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findByIdAndDelete(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.status(200).json({ message: 'Question deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error: error.message });
    }
};

const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

// Cấu hình Multer để lưu tệp upload
const upload = multer({ dest: 'uploads/' });

// Hàm xử lý import file
exports.importQuestions = [
    upload.single('file'), // Chỉ chấp nhận một tệp
    async (req, res) => {
        try {
            const filePath = req.file.path;

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
                    console.log(`Skipping invalid row: ${JSON.stringify(row)}`);
                    continue;
                }
            
                // Tách các lựa chọn thành mảng
                const optionsArray = options.split(',').map(opt => opt.trim());
                if (optionsArray.length < 2) {
                    console.log(`Skipping row with insufficient options: ${JSON.stringify(row)}`);
                    continue;
                }
            
                // Kiểm tra correctAnswer là chuỗi trước khi gọi trim()
                const formattedCorrectAnswer = typeof correctAnswer === 'string' ? correctAnswer.trim() : correctAnswer;
            
                // Tạo đối tượng câu hỏi
                validQuestions.push({
                    questionText: questionText.trim(),
                    options: optionsArray,
                    correctAnswer: formattedCorrectAnswer,
                    explanation: explanation ? explanation.trim() : '',
                    difficulty: difficulty || 'medium',
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    //createdBy: req.user._id, // Gán ID người dùng tạo
                });
            }
            

            // Lưu các câu hỏi hợp lệ vào database
            if (validQuestions.length > 0) {
                await Question.insertMany(validQuestions);
                res.status(200).json({ message: 'Questions imported successfully!', imported: validQuestions.length });
            } else {
                res.status(400).json({ message: 'No valid questions found in the file.' });
            }
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Failed to import questions', error: error.message });
        } finally {
            // Xóa file sau khi xử lý xong
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to delete file:', err);
            });
        }
    }
];

// Export Questions (Xuất câu hỏi)
exports.exportQuestions = async (req, res) => {
    try {
        // Đảm bảo không có truy cập req.params.id trong logic export
        const questions = await Question.find().lean();

        const data = questions.map((q) => ({
            QuestionText: q.questionText,
            Options: q.options.join(', '),
            CorrectAnswer: q.correctAnswer,
            Explanation: q.explanation || '',
            Difficulty: q.difficulty || 'medium',
            Tags: q.tags.join(', '),
            CreatedAt: q.createdAt ? q.createdAt.toISOString() : '',
            UpdatedAt: q.updatedAt ? q.updatedAt.toISOString() : ''
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

        const filePath = 'questions.xlsx';
        XLSX.writeFile(workbook, filePath);

        res.download(filePath, (err) => {
            if (err) {
                console.error('Failed to send file:', err);
                res.status(500).json({ message: 'Failed to export questions to Excel' });
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete file:', unlinkErr);
            });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Failed to export questions to Excel', error: error.message });
    }
};
