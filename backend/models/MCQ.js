const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  topicSlug: { type: String, required: true, index: true },
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Must have exactly 4 options']
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

mcqSchema.index({ topicSlug: 1, order: 1 });

module.exports = mongoose.model('MCQ', mcqSchema);
