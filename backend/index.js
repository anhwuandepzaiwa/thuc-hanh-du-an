// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser');

// Khởi tạo Express
const app = express();

// Cấu hình biến môi trường
dotenv.config();

// Middleware
app.use(express.json()); // Xử lý JSON từ body của request
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(cookieParser());

// Import các route
const questionRoutes = require('./routes/questionRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const examRoutes = require('./routes/examRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRouters = require('./routes/roleRoutes');
const permissionRouters = require('./routes/permissionRoutes');
const authRoutes = require('./routes/authRoutes');
const questionTypeRoutes = require('./routes/questionTypeRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');

// Sử dụng route
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/users', userRoutes);
app.use('/api/role', roleRouters);
app.use('/api/permission', permissionRouters);
app.use('/api/question-types', questionTypeRoutes);
app.use('/api/question-banks', questionBankRoutes);

// Xử lý route không tồn tại
app.use((req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Lắng nghe kết nối
const PORT = process.env.PORT || 3000;
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("connnect to DB")
        console.log("Server is running "+PORT)
    })
})
