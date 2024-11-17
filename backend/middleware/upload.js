// middleware/upload.js
const multer = require('multer');

// Cấu hình Multer để chỉ chấp nhận các loại tệp nhất định
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Thư mục lưu trữ tệp tải lên
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên tệp duy nhất
    }
});

// Kiểm tra loại tệp
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.pdf']; // Các loại tệp hỗ trợ
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    if (allowedTypes.includes('.' + fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .csv, .xlsx, and .pdf are allowed.'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
