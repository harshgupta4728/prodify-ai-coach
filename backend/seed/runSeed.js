const mongoose = require('mongoose');
const connectForSeeding = require('../lib/seedConnect');
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
    await connectForSeeding('delete and re-create all topics, MCQs and interview questions');

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
