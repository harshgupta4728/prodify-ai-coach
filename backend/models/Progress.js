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
  
  // Quiz scores per topic { topicSlug: { bestScore, totalQuestions, attempts, lastAttempt } }
  quizScores: {
    type: Map,
    of: new mongoose.Schema({
      bestScore: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      attempts: { type: Number, default: 0 },
      lastAttempt: { type: Date }
    }, { _id: false }),
    default: {}
  },

  // Articles/subtopics read
  articlesRead: [{
    topicSlug: { type: String },
    subtopicId: { type: String },
    readAt: { type: Date, default: Date.now }
  }],

  // Interview questions viewed count per topic
  interviewQuestionsViewed: {
    type: Map,
    of: Number,
    default: {}
  },

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

// One progress document per user. This unique index is not declared with
// schema.index(): if duplicates already exist, Mongoose's automatic index build
// would crash the server. server.js calls this at startup instead, and it only
// warns until `npm run fix:duplicate-progress` has cleaned up.
progressSchema.statics.ensureUniqueUserIndex = async function () {
  try {
    await this.collection.createIndex({ userId: 1 }, { unique: true });
  } catch (error) {
    console.warn(`Progress: unique index on userId not created (${error.message}). ` +
      'Run "npm run fix:duplicate-progress" to see why; it removes duplicates and replaces a non-unique userId index.');
  }
};

// Atomic get-or-create, so two requests for a brand-new user can't each create a document.
// timestamps: false keeps it a pure read for existing documents (no updatedAt bump).
progressSchema.statics.forUser = function (userId) {
  return this.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false }
  );
};

// Streaks are computed from the solve history in routes/progress.js (applyStreaks).
// They used to be bumped here on every save, so merely opening the app raised them.

module.exports = mongoose.model('Progress', progressSchema); 