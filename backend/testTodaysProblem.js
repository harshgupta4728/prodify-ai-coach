const mongoose = require('mongoose');
const TodaysProblemBank = require('./models/TodaysProblemBank');
const Progress = require('./models/Progress');
require('dotenv').config();

async function testTodaysProblem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harshgupta4728:HgTg4728@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify');
    console.log('Connected to MongoDB');

    // Check if TodaysProblemBank has problems
    const todaysProblems = await TodaysProblemBank.find({});
    console.log(`Found ${todaysProblems.length} problems in TodaysProblemBank`);

    if (todaysProblems.length === 0) {
      console.log('No problems found in TodaysProblemBank. Please run seedTodaysProblemBank.js first.');
      return;
    }

    // Show first few problems
    console.log('\nFirst 5 problems in TodaysProblemBank:');
    todaysProblems.slice(0, 5).forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} (${problem.difficulty}) - ${problem.topics.join(', ')}`);
    });

    // Test the daily problem selection logic
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const randomIndex = dayOfYear % todaysProblems.length;
    const todaysProblem = todaysProblems[randomIndex];

    console.log(`\nToday's date: ${today.toDateString()}`);
    console.log(`Day of year: ${dayOfYear}`);
    console.log(`Random index: ${randomIndex}`);
    console.log(`Today's problem: ${todaysProblem.title} (${todaysProblem.difficulty})`);

    // Test with a mock user progress
    const mockUserId = new mongoose.Types.ObjectId();
    let progress = await Progress.findOne({ userId: mockUserId });
    
    if (!progress) {
      progress = new Progress({
        userId: mockUserId,
        currentStreak: 0,
        todaysProblemStreak: 0,
        longestStreak: 0,
        longestTodaysProblemStreak: 0,
        totalProblemsSolved: 0,
        currentRating: 1200
      });
      await progress.save();
    }

    // Initialize user's today's problem bank
    progress.todaysProblemBank = todaysProblems.map(problem => ({
      problemId: problem.problemId,
      title: problem.title,
      difficulty: problem.difficulty,
      topics: problem.topics,
      problemUrl: problem.problemUrl,
      day: problem.day
    }));
    await progress.save();

    console.log('\nMock user progress created successfully');
    console.log(`User's today's problem bank has ${progress.todaysProblemBank.length} problems`);

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error testing today\'s problem:', error);
    process.exit(1);
  }
}

testTodaysProblem(); 