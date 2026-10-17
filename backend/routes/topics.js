const express = require('express');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const InterviewQuestion = require('../models/InterviewQuestion');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');
const { pick } = require('../lib/validate');

const router = express.Router();

// Fields admins may set; anything else in the body (like _id or counts) is ignored
const TOPIC_FIELDS = ['name', 'slug', 'icon', 'color', 'difficulty', 'estimatedHours', 'description', 'subtopics', 'order', 'isActive'];
const MCQ_FIELDS = ['question', 'options', 'correctIndex', 'explanation', 'difficulty', 'order'];
const INTERVIEW_QUESTION_FIELDS = ['question', 'answer', 'difficulty', 'frequency', 'companies', 'order'];

// The topic list is identical for every user and only changes through the admin routes
// below, so it is cached for a few minutes instead of being read on every page load
const TOPICS_CACHE_MS = 5 * 60 * 1000;
let topicsCache = null;
const clearTopicsCache = () => { topicsCache = null; };

const countByTopic = async (Model) => {
  const rows = await Model.aggregate([{ $group: { _id: '$topicSlug', count: { $sum: 1 } } }]);
  return new Map(rows.map((row) => [row._id, row.count]));
};

// ============ TOPICS ============

// Get all topics (with counts)
router.get('/', auth, async (req, res) => {
  try {
    if (!topicsCache || topicsCache.expiresAt < Date.now()) {
      const [topics, mcqCounts, iqCounts] = await Promise.all([
        Topic.find({ isActive: true }).sort({ order: 1 }).lean(),
        countByTopic(MCQ),
        countByTopic(InterviewQuestion)
      ]);

      topicsCache = {
        data: topics.map((topic) => ({
          ...topic,
          mcqCount: mcqCounts.get(topic.slug) || 0,
          interviewQuestionCount: iqCounts.get(topic.slug) || 0
        })),
        expiresAt: Date.now() + TOPICS_CACHE_MS
      };
    }

    res.json(topicsCache.data);
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get single topic by slug
router.get('/:slug', auth, async (req, res) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug, isActive: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });

    const mcqCount = await MCQ.countDocuments({ topicSlug: topic.slug });
    const iqCount = await InterviewQuestion.countDocuments({ topicSlug: topic.slug });

    res.json({
      ...topic.toObject(),
      mcqCount,
      interviewQuestionCount: iqCount
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create topic
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const fields = pick(req.body, TOPIC_FIELDS);
    const topic = new Topic({ ...fields, subtopics: fields.subtopics || [], order: fields.order || 0 });
    await topic.save();
    clearTopicsCache();
    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    if (error.code === 11000) return res.status(400).json({ error: 'Topic slug already exists.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update topic
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { $set: pick(req.body, TOPIC_FIELDS) }, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    clearTopicsCache();
    res.json(topic);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete topic (soft delete)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    clearTopicsCache();
    res.json({ message: 'Topic deleted.' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============ MCQs ============

// Get MCQs for a topic
router.get('/:slug/mcqs', auth, async (req, res) => {
  try {
    const mcqs = await MCQ.find({ topicSlug: req.params.slug }).sort({ order: 1 });
    res.json(mcqs);
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create MCQ
router.post('/:slug/mcqs', auth, requireAdmin, async (req, res) => {
  try {
    const fields = pick(req.body, MCQ_FIELDS);
    const mcq = new MCQ({
      ...fields,
      topicSlug: req.params.slug,
      difficulty: fields.difficulty || 'medium',
      order: fields.order || 0
    });
    await mcq.save();
    clearTopicsCache();
    res.status(201).json(mcq);
  } catch (error) {
    console.error('Create MCQ error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update MCQ
router.put('/mcqs/:id', auth, requireAdmin, async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(req.params.id, { $set: pick(req.body, MCQ_FIELDS) }, { new: true, runValidators: true });
    if (!mcq) return res.status(404).json({ error: 'MCQ not found.' });
    res.json(mcq);
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete MCQ
router.delete('/mcqs/:id', auth, requireAdmin, async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);
    if (!mcq) return res.status(404).json({ error: 'MCQ not found.' });
    clearTopicsCache();
    res.json({ message: 'MCQ deleted.' });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============ INTERVIEW QUESTIONS ============

// Get interview questions for a topic
router.get('/:slug/interview-questions', auth, async (req, res) => {
  try {
    const questions = await InterviewQuestion.find({ topicSlug: req.params.slug }).sort({ order: 1 });
    res.json(questions);
  } catch (error) {
    console.error('Get interview questions error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create interview question
router.post('/:slug/interview-questions', auth, requireAdmin, async (req, res) => {
  try {
    const fields = pick(req.body, INTERVIEW_QUESTION_FIELDS);
    const iq = new InterviewQuestion({
      ...fields,
      topicSlug: req.params.slug,
      difficulty: fields.difficulty || 'medium',
      frequency: fields.frequency || 'medium',
      companies: fields.companies || [],
      order: fields.order || 0
    });
    await iq.save();
    clearTopicsCache();
    res.status(201).json(iq);
  } catch (error) {
    console.error('Create interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update interview question
router.put('/interview-questions/:id', auth, requireAdmin, async (req, res) => {
  try {
    const iq = await InterviewQuestion.findByIdAndUpdate(req.params.id, { $set: pick(req.body, INTERVIEW_QUESTION_FIELDS) }, { new: true, runValidators: true });
    if (!iq) return res.status(404).json({ error: 'Interview question not found.' });
    res.json(iq);
  } catch (error) {
    console.error('Update interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete interview question
router.delete('/interview-questions/:id', auth, requireAdmin, async (req, res) => {
  try {
    const iq = await InterviewQuestion.findByIdAndDelete(req.params.id);
    if (!iq) return res.status(404).json({ error: 'Interview question not found.' });
    clearTopicsCache();
    res.json({ message: 'Interview question deleted.' });
  } catch (error) {
    console.error('Delete interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
