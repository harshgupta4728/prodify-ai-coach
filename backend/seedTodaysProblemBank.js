const mongoose = require('mongoose');
const TodaysProblemBank = require('./models/TodaysProblemBank');
const ProblemBank = require('./models/ProblemBank');
require('dotenv').config();

async function seedTodaysProblemBank() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harshgupta4728:HgTg4728@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify');
    console.log('Connected to MongoDB');

    // Clear existing today's problems
    await TodaysProblemBank.deleteMany({});
    console.log('Cleared existing today\'s problems');

    // Get all problems from ProblemBank
    const allProblems = await ProblemBank.find({});
    console.log(`Found ${allProblems.length} problems in ProblemBank`);

    // Select 20 problems for today's problem bank (mix of difficulties and topics)
    const selectedProblems = [];
    
    // Select 8 easy problems
    const easyProblems = allProblems.filter(p => p.difficulty === 'easy');
    selectedProblems.push(...easyProblems.slice(0, 8));
    
    // Select 8 medium problems
    const mediumProblems = allProblems.filter(p => p.difficulty === 'medium');
    selectedProblems.push(...mediumProblems.slice(0, 8));
    
    // Select 4 hard problems
    const hardProblems = allProblems.filter(p => p.difficulty === 'hard');
    selectedProblems.push(...hardProblems.slice(0, 4));

    // Create today's problem entries with rich content
    const todaysProblems = selectedProblems.map((problem, index) => ({
      problemId: `TODAY_${problem.problemId}`,
      title: problem.title,
      difficulty: problem.difficulty,
      topics: problem.topics,
      problemUrl: problem.problemUrl,
      description: problem.description,
      examples: problem.examples,
      constraints: problem.constraints,
      hints: problem.hints,
      approach: problem.approach,
      day: index + 1
    }));

    // Insert today's problems
    const result = await TodaysProblemBank.insertMany(todaysProblems);
    console.log(`Successfully seeded ${result.length} today's problems`);

    // Log the problems for verification
    console.log('\nToday\'s Problems:');
    result.forEach((problem, index) => {
      console.log(`${index + 1}. ${problem.title} (${problem.difficulty}) - ${problem.topics.join(', ')}`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding today\'s problems:', error);
    process.exit(1);
  }
}

seedTodaysProblemBank(); 