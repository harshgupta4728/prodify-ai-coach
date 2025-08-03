const mongoose = require('mongoose');

const problemBankSchema = new mongoose.Schema({
  // Problem details
  title: {
    type: String,
    required: true
  },
  problemId: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'geeksforgeeks', 'hackerrank'],
    default: 'leetcode'
  },
  problemUrl: {
    type: String,
    required: true
  },
  
  // Problem classification
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  topics: [{
    type: String,
    enum: [
      'arrays', 'strings', 'linkedLists', 'trees', 'graphs', 
      'dynamicProgramming', 'greedy', 'backtracking', 'binarySearch',
      'twoPointers', 'slidingWindow', 'stack', 'queue', 'heap',
      'trie', 'unionFind', 'bitManipulation', 'math', 'geometry'
    ],
    required: true
  }],
  
  // Problem content
  description: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  
  // Solution hints
  hints: [String],
  approach: String,
  
  // Statistics
  acceptanceRate: {
    type: Number,
    default: 0
  },
  frequency: {
    type: Number,
    default: 0
  },
  
  // Learning path order
  orderInTopic: {
    type: Number,
    default: 0
  },
  
  // Tags for better categorization
  tags: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
problemBankSchema.index({ topics: 1, difficulty: 1 });
problemBankSchema.index({ problemId: 1 });
problemBankSchema.index({ orderInTopic: 1 });

module.exports = mongoose.model('ProblemBank', problemBankSchema); 