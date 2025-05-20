// backend/models/Search.js
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: [true, 'Search query is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Search', searchSchema);