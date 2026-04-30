require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const InterviewQuestion = require('../models/InterviewQuestion');

// Import all topic data files
const topics1 = require('./topics1'); // Arrays, Strings, Linked Lists
const topics2 = require('./topics2'); // Stack & Queue, Trees, Graphs
const topics3 = require('./topics3'); // DP, Binary Search, Greedy
const topics4 = require('./topics4'); // Backtracking, Two Pointers, Sliding Window
const topics5 = require('./topics5'); // Heap, Hashing, Sorting

const allData = [...topics1, ...topics2, ...topics3, ...topics4, ...topics5];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://harshgupta4728:QZacVUXirg95GKIS@ac-ecwklhy-shard-00-00.pafygw3.mongodb.net:27017,ac-ecwklhy-shard-00-01.pafygw3.mongodb.net:27017,ac-ecwklhy-shard-00-02.pafygw3.mongodb.net:27017/?ssl=true&replicaSet=atlas-f082mj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=prodify';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Topic.deleteMany({});
    await MCQ.deleteMany({});
    await InterviewQuestion.deleteMany({});
    console.log('Cleared existing topics, MCQs, and interview questions');

    let topicCount = 0, mcqCount = 0, iqCount = 0;

    for (const data of allData) {
      const { mcqs, interviewQuestions, ...topicData } = data;

      // Create topic
      await Topic.create(topicData);
      topicCount++;
      console.log(`✅ Created topic: ${topicData.name} (${topicData.slug})`);

      // Create MCQs
      if (mcqs && mcqs.length > 0) {
        await MCQ.insertMany(mcqs.map((m, i) => ({ ...m, topicSlug: topicData.slug, order: i })));
        mcqCount += mcqs.length;
        console.log(`   📝 ${mcqs.length} MCQs`);
      }

      // Create Interview Questions
      if (interviewQuestions && interviewQuestions.length > 0) {
        await InterviewQuestion.insertMany(interviewQuestions.map((q, i) => ({ ...q, topicSlug: topicData.slug, order: i })));
        iqCount += interviewQuestions.length;
        console.log(`   💬 ${interviewQuestions.length} Interview Questions`);
      }
    }

    console.log(`\n🎉 Seed complete! ${topicCount} topics, ${mcqCount} MCQs, ${iqCount} interview questions`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
