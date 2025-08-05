const mongoose = require('mongoose');

const todaysProblemBankSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  topics: {
    type: [String],
    default: [],
  },
  problemUrl: {
    type: String,
    required: true,
  },
  // Rich problem content
  description: {
    type: String,
    required: true,
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  hints: [String],
  approach: String,
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
});

const TodaysProblemBank = mongoose.model('TodaysProblemBank', todaysProblemBankSchema);

module.exports = TodaysProblemBank; 