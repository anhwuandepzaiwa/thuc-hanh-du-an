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
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
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
