const express = require('express');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const ProblemBank = require('../models/ProblemBank');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's progress
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      // Create new progress record for user
      progress = new Progress({
        userId: req.user._id,
        currentStreak: 0,
        totalProblemsSolved: 0,
        currentRating: 1200
      });
      await progress.save();
    }

    // Get recent problems solved
    const recentProblems = await Problem.find({ 
      userId: req.user._id,
      status: 'solved'
    })
    .sort({ solvedAt: -1 })
    .limit(5);

    // Calculate weekly and monthly stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyProblems = await Problem.countDocuments({
      userId: req.user._id,
      status: 'solved',
      solvedAt: { $gte: weekAgo }
    });

    const monthlyProblems = await Problem.countDocuments({
      userId: req.user._id,
      status: 'solved',
      solvedAt: { $gte: monthAgo }
    });

    // Update progress with current stats
    progress.problemsSolvedThisWeek = weeklyProblems;
    progress.problemsSolvedThisMonth = monthlyProblems;
    progress.totalProblemsSolved = await Problem.countDocuments({
      userId: req.user._id,
      status: 'solved'
    });

    await progress.save();

    res.json({
      progress,
      recentProblems,
      stats: {
        weeklyProblems,
        monthlyProblems,
        totalProblems: progress.totalProblemsSolved
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error while fetching progress.' });
  }
});

// Add a solved problem
router.post('/problem', auth, async (req, res) => {
  try {
    const {
      title,
      platform,
      problemId,
      problemUrl,
      difficulty,
      topics,
      language,
      code,
      timeComplexity,
      spaceComplexity,
      executionTime,
      memoryUsed,
      runtimeBeats,
      memoryBeats,
      timeSpent,
      notes,
      rating
    } = req.body;

    // Check if problem already exists
    const existingProblem = await Problem.findOne({
      userId: req.user._id,
      platform,
      problemId
    });

    if (existingProblem) {
      return res.status(400).json({ error: 'Problem already exists in your solved list.' });
    }

    // Create new problem record
    const problem = new Problem({
      userId: req.user._id,
      title,
      platform,
      problemId,
      problemUrl,
      difficulty,
      topics,
      solution: {
        language,
        code,
        timeComplexity,
        spaceComplexity,
        submissionTime: new Date()
      },
      executionTime,
      memoryUsed,
      runtimeBeats,
      memoryBeats,
      timeSpent,
      notes,
      rating
    });

    await problem.save();

    // Update progress
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }

    // Update topic progress
    topics.forEach(topic => {
      if (progress.topicProgress[topic] !== undefined) {
        progress.topicProgress[topic] += 1;
      }
    });

    // Update difficulty progress
    if (progress.difficultyProgress[difficulty] !== undefined) {
      progress.difficultyProgress[difficulty] += 1;
    }

    // Update rating based on difficulty
    const ratingChange = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
    progress.currentRating += ratingChange;
    
    if (progress.currentRating > progress.highestRating) {
      progress.highestRating = progress.currentRating;
    }

    // Update last activity for streak
    progress.lastActivityDate = new Date();

    await progress.save();

    res.json({
      message: 'Problem added successfully!',
      problem,
      progress
    });

  } catch (error) {
    console.error('Add problem error:', error);
    res.status(500).json({ error: 'Server error while adding problem.' });
  }
});

// Get recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      return res.json({
        recommendations: [
          {
            type: 'topic',
            title: 'Start with Arrays',
            description: 'Begin your DSA journey with fundamental array problems',
            action: 'Start Arrays',
            priority: 'high',
            reason: 'Perfect starting point for beginners'
          }
        ]
      });
    }

    const recommendations = [];

    // Topic-based recommendations
    const topicOrder = [
      'arrays', 'strings', 'linkedLists', 'trees', 'graphs',
      'dynamicProgramming', 'greedy', 'backtracking', 'binarySearch'
    ];

    for (const topic of topicOrder) {
      const topicProgress = progress.topicProgress[topic] || 0;
      
      if (topicProgress < 5) {
        recommendations.push({
          type: 'topic',
          title: `Practice ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
          description: `You've solved ${topicProgress} ${topic} problems. Aim for at least 5 to build a strong foundation.`,
          action: `Start ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
          priority: topicProgress === 0 ? 'high' : 'medium',
          reason: topicProgress === 0 ? 'New topic to explore' : 'Need more practice',
          topic,
          currentProgress: topicProgress,
          targetProgress: 5
        });
        break; // Focus on one topic at a time
      }
    }

    // Streak recommendations
    if (progress.currentStreak < 7) {
      recommendations.push({
        type: 'streak',
        title: 'Build Your Streak',
        description: `You're on a ${progress.currentStreak}-day streak! Try to reach 7 days for a bonus.`,
        action: 'Solve Today\'s Problem',
        priority: 'medium',
        reason: 'Consistency is key to learning',
        currentStreak: progress.currentStreak,
        targetStreak: 7
      });
    }

    // Goal recommendations
    const weeklyProgress = progress.problemsSolvedThisWeek || 0;
    const weeklyGoal = progress.weeklyGoal || 15;
    
    if (weeklyProgress < weeklyGoal) {
      const remaining = weeklyGoal - weeklyProgress;
      recommendations.push({
        type: 'goal',
        title: 'Weekly Goal Progress',
        description: `You've solved ${weeklyProgress}/${weeklyGoal} problems this week. ${remaining} more to reach your goal!`,
        action: 'Solve More Problems',
        priority: 'medium',
        reason: 'Stay on track with your weekly goals',
        currentProgress: weeklyProgress,
        targetProgress: weeklyGoal
      });
    }

    // Difficulty recommendations
    const easyCount = progress.difficultyProgress.easy || 0;
    const mediumCount = progress.difficultyProgress.medium || 0;
    const hardCount = progress.difficultyProgress.hard || 0;

    if (easyCount < 10) {
      recommendations.push({
        type: 'difficulty',
        title: 'Master Easy Problems',
        description: `You've solved ${easyCount} easy problems. Build confidence with more easy problems before moving to medium.`,
        action: 'Practice Easy Problems',
        priority: 'medium',
        reason: 'Build strong fundamentals',
        difficulty: 'easy',
        currentCount: easyCount,
        targetCount: 10
      });
    } else if (mediumCount < 5 && easyCount >= 10) {
      recommendations.push({
        type: 'difficulty',
        title: 'Try Medium Problems',
        description: `You're ready for medium problems! Start with ${mediumCount + 1} medium problems.`,
        action: 'Start Medium Problems',
        priority: 'high',
        reason: 'Time to level up',
        difficulty: 'medium',
        currentCount: mediumCount,
        targetCount: 5
      });
    }

    res.json({
      recommendations: recommendations.slice(0, 3) // Return top 3 recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error while fetching recommendations.' });
  }
});

// Update daily goal
router.put('/goals', auth, async (req, res) => {
  try {
    const { dailyGoal, weeklyGoal } = req.body;
    
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }

    if (dailyGoal !== undefined) progress.dailyGoal = dailyGoal;
    if (weeklyGoal !== undefined) progress.weeklyGoal = weeklyGoal;

    await progress.save();

    res.json({
      message: 'Goals updated successfully',
      progress
    });

  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ error: 'Server error while updating goals.' });
  }
});

// Get user's solved problems
router.get('/problems', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, topic, difficulty, platform } = req.query;
    
    const filter = { userId: req.user._id, status: 'solved' };
    
    if (topic) filter.topics = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;

    const problems = await Problem.find(filter)
      .sort({ solvedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Server error while fetching problems.' });
  }
});

// Get problems from problem bank
router.get('/problem-bank', auth, async (req, res) => {
  try {
    const { topic, difficulty, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (topic) filter.topics = topic;
    if (difficulty) filter.difficulty = difficulty;

    const problems = await ProblemBank.find(filter)
      .sort({ orderInTopic: 1, difficulty: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProblemBank.countDocuments(filter);

    // Get user's solved problems to mark them
    const userSolvedProblems = await Problem.find({ 
      userId: req.user._id,
      status: 'solved'
    }).select('problemId');

    const solvedProblemIds = userSolvedProblems.map(p => p.problemId);

    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.includes(problem.problemId)
    }));

    res.json({
      problems: problemsWithStatus,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get problem bank error:', error);
    res.status(500).json({ error: 'Server error while fetching problem bank.' });
  }
});

// Get problems by topic
router.get('/problems-by-topic/:topic', auth, async (req, res) => {
  try {
    const { topic } = req.params;
    
    const problems = await ProblemBank.find({ topics: topic })
      .sort({ orderInTopic: 1, difficulty: 1 });

    // Get user's solved problems for this topic
    const userSolvedProblems = await Problem.find({ 
      userId: req.user._id,
      status: 'solved'
    }).select('problemId');

    const solvedProblemIds = userSolvedProblems.map(p => p.problemId);

    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.includes(problem.problemId)
    }));

    res.json({
      problems: problemsWithStatus,
      topic,
      totalProblems: problems.length,
      solvedProblems: solvedProblemIds.length
    });

  } catch (error) {
    console.error('Get problems by topic error:', error);
    res.status(500).json({ error: 'Server error while fetching problems by topic.' });
  }
});

// Mark problem as solved
router.post('/mark-solved', auth, async (req, res) => {
  try {
    const { problemId, solution, language, timeSpent, notes } = req.body;

    // Get problem from problem bank
    const problemBank = await ProblemBank.findOne({ problemId });
    if (!problemBank) {
      return res.status(404).json({ error: 'Problem not found in problem bank.' });
    }

    // Check if already solved
    const existingProblem = await Problem.findOne({
      userId: req.user._id,
      problemId: problemId
    });

    if (existingProblem) {
      return res.status(400).json({ error: 'Problem already marked as solved.' });
    }

    // Create solved problem record
    const solvedProblem = new Problem({
      userId: req.user._id,
      title: problemBank.title,
      platform: problemBank.platform,
      problemId: problemBank.problemId,
      problemUrl: problemBank.problemUrl,
      difficulty: problemBank.difficulty,
      topics: problemBank.topics,
      solution: {
        language: language || 'python',
        code: solution || '',
        submissionTime: new Date()
      },
      timeSpent: timeSpent || 0,
      notes: notes || '',
      status: 'solved'
    });

    await solvedProblem.save();

    // Update progress
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }

    // Update topic progress
    problemBank.topics.forEach(topic => {
      if (progress.topicProgress[topic] !== undefined) {
        progress.topicProgress[topic] += 1;
      }
    });

    // Update difficulty progress
    if (progress.difficultyProgress[problemBank.difficulty] !== undefined) {
      progress.difficultyProgress[problemBank.difficulty] += 1;
    }

    // Update rating based on difficulty
    const ratingChange = problemBank.difficulty === 'easy' ? 10 : problemBank.difficulty === 'medium' ? 20 : 30;
    progress.currentRating += ratingChange;
    
    if (progress.currentRating > progress.highestRating) {
      progress.highestRating = progress.currentRating;
    }

    // Update last activity for streak
    progress.lastActivityDate = new Date();

    await progress.save();

    res.json({
      message: 'Problem marked as solved successfully!',
      problem: solvedProblem,
      progress
    });

  } catch (error) {
    console.error('Mark solved error:', error);
    res.status(500).json({ error: 'Server error while marking problem as solved.' });
  }
});

module.exports = router; 