const express = require('express');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const InterviewQuestion = require('../models/InterviewQuestion');
const auth = require('../middleware/auth');

const router = express.Router();

// ============ TOPICS ============

// Get all topics (with counts)
router.get('/', auth, async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true }).sort({ order: 1 });

    // Get MCQ and Interview Question counts per topic
    const topicsWithCounts = await Promise.all(topics.map(async (topic) => {
      const mcqCount = await MCQ.countDocuments({ topicSlug: topic.slug });
      const iqCount = await InterviewQuestion.countDocuments({ topicSlug: topic.slug });
      return {
        ...topic.toObject(),
        mcqCount,
        interviewQuestionCount: iqCount
      };
    }));

    res.json(topicsWithCounts);
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
router.post('/', auth, async (req, res) => {
  try {
    const { name, slug, icon, color, difficulty, estimatedHours, description, subtopics, order } = req.body;
    const topic = new Topic({ name, slug, icon, color, difficulty, estimatedHours, description, subtopics: subtopics || [], order: order || 0 });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    if (error.code === 11000) return res.status(400).json({ error: 'Topic slug already exists.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update topic
router.put('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    res.json(topic);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete topic (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
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
router.post('/:slug/mcqs', auth, async (req, res) => {
  try {
    const { question, options, correctIndex, explanation, difficulty, order } = req.body;
    const mcq = new MCQ({
      topicSlug: req.params.slug,
      question, options, correctIndex, explanation,
      difficulty: difficulty || 'medium',
      order: order || 0
    });
    await mcq.save();
    res.status(201).json(mcq);
  } catch (error) {
    console.error('Create MCQ error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update MCQ
router.put('/mcqs/:id', auth, async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mcq) return res.status(404).json({ error: 'MCQ not found.' });
    res.json(mcq);
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete MCQ
router.delete('/mcqs/:id', auth, async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);
    if (!mcq) return res.status(404).json({ error: 'MCQ not found.' });
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
router.post('/:slug/interview-questions', auth, async (req, res) => {
  try {
    const { question, answer, difficulty, frequency, companies, order } = req.body;
    const iq = new InterviewQuestion({
      topicSlug: req.params.slug,
      question, answer,
      difficulty: difficulty || 'medium',
      frequency: frequency || 'medium',
      companies: companies || [],
      order: order || 0
    });
    await iq.save();
    res.status(201).json(iq);
  } catch (error) {
    console.error('Create interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update interview question
router.put('/interview-questions/:id', auth, async (req, res) => {
  try {
    const iq = await InterviewQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!iq) return res.status(404).json({ error: 'Interview question not found.' });
    res.json(iq);
  } catch (error) {
    console.error('Update interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete interview question
router.delete('/interview-questions/:id', auth, async (req, res) => {
  try {
    const iq = await InterviewQuestion.findByIdAndDelete(req.params.id);
    if (!iq) return res.status(404).json({ error: 'Interview question not found.' });
    res.json({ message: 'Interview question deleted.' });
  } catch (error) {
    console.error('Delete interview question error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
