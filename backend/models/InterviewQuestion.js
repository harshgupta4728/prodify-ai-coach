const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  topicSlug: { type: String, required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  frequency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  companies: [{ type: String, trim: true }],
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

interviewQuestionSchema.index({ topicSlug: 1, order: 1 });

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
