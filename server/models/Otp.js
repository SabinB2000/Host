// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:    { type: String, required: true, index: true },
  code:     { type: String, required: true },
  createdAt:{ type: Date,   default: Date.now, index: true }
});

// Automatically remove documents 10 minutes after createdAt
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Otp', otpSchema);
