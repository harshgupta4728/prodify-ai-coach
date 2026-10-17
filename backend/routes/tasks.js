const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { firstTooLong, isHttpUrl, pick } = require('../lib/validate');

const router = express.Router();

// Fields a user may change on their own task. userId, notificationSent, etc. are
// server-managed, so a client can't move a task into another user's account.
const UPDATABLE_FIELDS = [
  'title', 'description', 'category', 'priority', 'deadline', 'status', 'timeSpent',
  'difficulty', 'estimatedTime', 'subtasks', 'link', 'tags', 'notes'
];
const TEXT_LIMITS = { title: 200, description: 5000, notes: 5000 };
const MAX_TASKS_PER_USER = 1000;

// Returns an error message for oversized or unsafe input, otherwise null
const validateTaskInput = (fields) => {
  const tooLong = firstTooLong(fields, TEXT_LIMITS);
  if (tooLong) {
    return `${tooLong} can be at most ${TEXT_LIMITS[tooLong]} characters.`;
  }
  // Rendered as a clickable link, so only http(s) URLs are allowed
  if (fields.link && !isHttpUrl(fields.link)) {
    return 'Link must be a full URL starting with http:// or https://';
  }
  if (fields.tags !== undefined &&
      (!Array.isArray(fields.tags) || fields.tags.length > 20 ||
       fields.tags.some((tag) => typeof tag !== 'string' || tag.length > 50))) {
    return 'Use at most 20 tags of up to 50 characters each.';
  }
  if (fields.subtasks !== undefined &&
      (!Array.isArray(fields.subtasks) || fields.subtasks.length > 50 ||
       fields.subtasks.some((subtask) => typeof subtask?.text === 'string' && subtask.text.length > 500))) {
    return 'Use at most 50 subtasks of up to 500 characters each.';
  }
  return null;
};

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      deadline,
      tags,
      estimatedTime,
      subtasks,
      link
    } = req.body;

    const inputError = validateTaskInput({ title, description, tags, subtasks, link });
    if (inputError) {
      return res.status(400).json({ error: inputError });
    }

    if (await Task.countDocuments({ userId: req.user._id }) >= MAX_TASKS_PER_USER) {
      return res.status(400).json({ error: `You can have at most ${MAX_TASKS_PER_USER} tasks. Please delete some old ones first.` });
    }

    const task = new Task({
      userId: req.user._id,
      title,
      description,
      category,
      priority,
      deadline: new Date(deadline),
      tags: tags || [],
      estimatedTime: estimatedTime || 0,
      subtasks: subtasks || [],
      link: link || ''
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updates = pick(req.body, UPDATABLE_FIELDS);
    const inputError = validateTaskInput(updates);
    if (inputError) {
      return res.status(400).json({ error: inputError });
    }

    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
      // A moved deadline needs a fresh reminder
      if (updates.deadline.getTime() !== task.deadline.getTime()) {
        updates.notificationSent = false;
      }
    }

    // Sync status and completed fields
    if (updates.status === 'done' && !task.completed) {
      updates.completed = true;
      updates.completedAt = new Date();
    } else if (updates.status && updates.status !== 'done' && task.completed) {
      updates.completed = false;
      updates.completedAt = undefined;
    }

    Object.assign(task, updates);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Mark task as completed
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const { timeSpent, difficulty, notes } = req.body;

    const inputError = validateTaskInput({ notes });
    if (inputError) {
      return res.status(400).json({ error: inputError });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    task.completed = true;
    task.status = 'done';
    task.completedAt = new Date();
    if (timeSpent) task.timeSpent = timeSpent;
    if (difficulty) task.difficulty = difficulty;
    if (notes) task.notes = notes;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Mark task as incomplete
router.patch('/:id/incomplete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    task.completed = false;
    task.status = 'todo';
    task.completedAt = undefined;
    task.timeSpent = 0;
    task.difficulty = 'medium';
    task.notes = '';

    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Incomplete task error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get tasks for notifications (tasks due soon)
router.get('/notifications/pending', auth, async (req, res) => {
  try {
    const now = new Date();
    const reminderTime = parseInt(req.query.reminderTime) || 60; // minutes
    const reminderDate = new Date(now.getTime() + reminderTime * 60 * 1000);

    const pendingTasks = await Task.find({
      userId: req.user._id,
      completed: false,
      deadline: { $lte: reminderDate, $gt: now },
      notificationSent: false
    });

    res.json(pendingTasks);
  } catch (error) {
    console.error('Get pending tasks error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Mark notification as sent
router.patch('/:id/notification-sent', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    task.notificationSent = true;
    await task.save();

    res.json({ message: 'Notification marked as sent.' });
  } catch (error) {
    console.error('Mark notification sent error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router; 