const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

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
      tags
    } = req.body;

    const task = new Task({
      userId: req.user._id,
      title,
      description,
      category,
      priority,
      deadline: new Date(deadline),
      tags: tags || []
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

    const updates = req.body;
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
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
    
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    task.completed = true;
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