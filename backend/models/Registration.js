const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'completed', 'cancelled'], default: 'registered' }
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
