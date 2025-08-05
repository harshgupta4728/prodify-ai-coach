const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  todaysProblemStreak: {
    type: Number,
    default: 0
  },
  longestTodaysProblemStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  // Problem solving stats
  totalProblemsSolved: {
    type: Number,
    default: 0
  },
  problemsSolvedThisWeek: {
    type: Number,
    default: 0
  },
  problemsSolvedThisMonth: {
    type: Number,
    default: 0
  },
  
  // Rating and achievements
  currentRating: {
    type: Number,
    default: 1200
  },
  highestRating: {
    type: Number,
    default: 1200
  },
  
  // Topic progress
  topicProgress: {
    arrays: { type: Number, default: 0 },
    strings: { type: Number, default: 0 },
    linkedLists: { type: Number, default: 0 },
    trees: { type: Number, default: 0 },
    graphs: { type: Number, default: 0 },
    dynamicProgramming: { type: Number, default: 0 },
    greedy: { type: Number, default: 0 },
    backtracking: { type: Number, default: 0 },
    binarySearch: { type: Number, default: 0 },
    twoPointers: { type: Number, default: 0 },
    slidingWindow: { type: Number, default: 0 },
    stack: { type: Number, default: 0 },
    queue: { type: Number, default: 0 },
    heap: { type: Number, default: 0 },
    trie: { type: Number, default: 0 },
    unionFind: { type: Number, default: 0 },
    bitManipulation: { type: Number, default: 0 },
    math: { type: Number, default: 0 },
    geometry: { type: Number, default: 0 }
  },
  
  // Difficulty level progress
  difficultyProgress: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  
  // Learning path
  currentTopic: {
    type: String,
    default: 'arrays'
  },
  currentWeek: {
    type: Number,
    default: 1
  },
  totalWeeks: {
    type: Number,
    default: 16
  },
  
  // Today's problem rotation
  todaysProblemDay: {
    type: Number,
    default: 1
  },
  todaysProblemBuffer: [{
    problemId: String,
    day: Number
  }],
  
  // Today's problem bank (20 specific problems)
  todaysProblemBank: [{
    problemId: String,
    title: String,
    difficulty: String,
    topics: [String],
    problemUrl: String,
    day: Number
  }],
  
  // Achievements and badges
  achievements: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  
  // Daily goals
  dailyGoal: {
    type: Number,
    default: 3
  },
  weeklyGoal: {
    type: Number,
    default: 15
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update streak when progress is updated
progressSchema.pre('save', function(next) {
  const today = new Date();
  const lastActivity = new Date(this.lastActivityDate);
  
  // Check if it's a new day
  if (today.toDateString() !== lastActivity.toDateString()) {
    const diffTime = Math.abs(today - lastActivity);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day - streak continues
      this.currentStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken - reset to 1 for today
      this.currentStreak = 1;
    }
    // If diffDays === 0, it's the same day, don't change streak
    
    this.lastActivityDate = today;
    
    // Update longest streak
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Same day - if this is the first problem solved today, start streak at 1
    if (this.currentStreak === 0) {
      this.currentStreak = 1;
    }
  }
  
  next();
});

module.exports = mongoose.model('Progress', progressSchema); 