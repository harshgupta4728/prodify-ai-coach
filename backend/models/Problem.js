const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Problem details
  title: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['leetcode', 'geeksforgeeks', 'hackerrank', 'codeforces'],
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemUrl: {
    type: String,
    required: true
  },
  
  // Solution details
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
    ]
  }],
  
  // User's solution
  solution: {
    language: {
      type: String,
      enum: ['cpp', 'java', 'python', 'javascript', 'csharp', 'go', 'rust'],
      required: true
    },
    code: String,
    timeComplexity: String,
    spaceComplexity: String,
    submissionTime: Date
  },
  
  // Performance metrics
  executionTime: Number, // in milliseconds
  memoryUsed: Number, // in MB
  runtimeBeats: Number, // percentage
  memoryBeats: Number, // percentage
  
  // Status
  status: {
    type: String,
    enum: ['solved', 'attempted', 'bookmarked'],
    default: 'solved'
  },
  
  // User notes
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Timestamps
  solvedAt: {
    type: Date,
    default: Date.now
  },
  lastAttempted: {
    type: Date,
    default: Date.now
  },
  
  // Attempts tracking
  attempts: {
    type: Number,
    default: 1
  },
  
  // Time spent
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
problemSchema.index({ userId: 1, platform: 1, solvedAt: -1 });
problemSchema.index({ userId: 1, topics: 1 });
problemSchema.index({ userId: 1, difficulty: 1 });

module.exports = mongoose.model('Problem', problemSchema); 