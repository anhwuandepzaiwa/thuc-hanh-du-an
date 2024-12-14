const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho Profile
const profileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true
    },
    address: {
        city: { type: String, trim: true },
        country: { type: String, trim: true }
    },
    bio: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png' // Đường dẫn đến ảnh đại diện mặc định
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', profileSchema);
