const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  concepts: [{ type: String }],
  codeExample: {
    title: { type: String },
    language: { type: String, default: 'javascript' },
    code: { type: String },
    explanation: { type: String }
  },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  order: { type: Number, default: 0 }
});

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  icon: { type: String, default: '📚' },
  color: { type: String, default: 'blue' },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedHours: { type: Number, default: 10 },
  description: { type: String, default: '' },
  subtopics: [subtopicSchema],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

topicSchema.index({ slug: 1 });
topicSchema.index({ order: 1 });

module.exports = mongoose.model('Topic', topicSchema);
