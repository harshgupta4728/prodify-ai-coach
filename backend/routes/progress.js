const express = require('express');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const ProblemBank = require('../models/ProblemBank');
const TodaysProblemBank = require('../models/TodaysProblemBank');
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
      progress: {
        ...progress.toObject(),
        todaysProblemStreak: progress.todaysProblemStreak || 0,
        longestTodaysProblemStreak: progress.longestTodaysProblemStreak || 0
      },
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

    // Allow multiple submissions for the same problem (like LeetCode)
    // No need to check if already exists - just create a new submission

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

    // Check if this is the first time solving this problem (before creating new record)
    const isFirstTimeSolving = !(await Problem.findOne({
      userId: req.user._id,
      platform,
      problemId
    }));

    // Only update progress stats if this is the first time solving this problem
    if (isFirstTimeSolving) {
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
    }

    // Update streak logic
    const today = new Date();
    const lastActivity = new Date(progress.lastActivityDate);
    
    // Check if it's a new day
    if (today.toDateString() !== lastActivity.toDateString()) {
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - streak continues
        progress.currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1 for today
        progress.currentStreak = 1;
      }
      // If diffDays === 0, it's the same day, don't change streak
    } else {
      // Same day - if this is the first problem solved today, start streak at 1
      if (progress.currentStreak === 0) {
        progress.currentStreak = 1;
      }
    }
    
    // Update longest streak
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
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

// Get all submissions for a specific problem
router.get('/problem-submissions/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const submissions = await Problem.find({ 
      userId: req.user._id,
      problemId: problemId,
      status: 'solved'
    })
    .sort({ solvedAt: -1 })
    .select('solution language timeSpent notes solvedAt executionTime memoryUsed runtimeBeats memoryBeats');

    res.json({
      submissions,
      totalSubmissions: submissions.length
    });

  } catch (error) {
    console.error('Get problem submissions error:', error);
    res.status(500).json({ error: 'Server error while fetching problem submissions.' });
  }
});

// Mark problem as solved
router.post('/mark-solved', auth, async (req, res) => {
  try {
    const { problemId, solution, language, timeSpent, notes } = req.body;

    // Check if this is a today's problem
    const isTodaysProblem = problemId.startsWith('TODAY_');
    
    let problemBank;
    if (isTodaysProblem) {
      // For today's problems, get from the central today's problem bank
      problemBank = await TodaysProblemBank.findOne({ problemId });
    } else {
      // For regular problems, get from problem bank
      problemBank = await ProblemBank.findOne({ problemId });
    }
    
    if (!problemBank) {
      return res.status(404).json({ error: 'Problem not found in problem bank.' });
    }

    // Allow multiple submissions for the same problem (like LeetCode)
    // No need to check if already solved - just create a new submission

    // Create solved problem record
    const solvedProblem = new Problem({
      userId: req.user._id,
      title: problemBank.title,
      platform: problemBank.platform || 'leetcode',
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

    // Check if this is the first time solving this problem (before creating new record)
    const isFirstTimeSolving = !(await Problem.findOne({
      userId: req.user._id,
      problemId: problemId
    }));

    // Only update progress stats if this is the first time solving this problem
    if (isFirstTimeSolving) {
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
    }

    // Update streak logic
    const today = new Date();
    const lastActivity = new Date(progress.lastActivityDate);
    
    // Check if it's a new day
    if (today.toDateString() !== lastActivity.toDateString()) {
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - streak continues
        progress.currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1 for today
        progress.currentStreak = 1;
      }
      // If diffDays === 0, it's the same day, don't change streak
    } else {
      // Same day - if this is the first problem solved today, start streak at 1
      if (progress.currentStreak === 0) {
        progress.currentStreak = 1;
      }
    }
    
    // Update longest streak
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
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

// Reset user progress
router.delete('/reset', auth, async (req, res) => {
  try {
    // Delete all solved problems for the user
    // This will reset the problem history but streak will be preserved in progress
    await Problem.deleteMany({ userId: req.user._id });
    
    // Reset progress to initial state
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }
    
    // Reset ALL progress fields including streak
    progress.currentStreak = 0;
    progress.todaysProblemStreak = 0;
    progress.longestStreak = 0;
    progress.longestTodaysProblemStreak = 0;
    progress.totalProblemsSolved = 0;
    progress.problemsSolvedThisWeek = 0;
    progress.problemsSolvedThisMonth = 0;
    progress.currentRating = 1200;
    progress.highestRating = 1200;
    progress.lastActivityDate = new Date();
    
    // Reset topic progress
    Object.keys(progress.topicProgress).forEach(topic => {
      progress.topicProgress[topic] = 0;
    });
    
    // Reset difficulty progress
    Object.keys(progress.difficultyProgress).forEach(difficulty => {
      progress.difficultyProgress[difficulty] = 0;
    });
    
    // Reset learning path
    progress.currentTopic = 'arrays';
    progress.currentWeek = 1;
    
    // Clear achievements
    progress.achievements = [];
    
    await progress.save();

    res.json({
      message: 'Progress reset successfully! All progress including streak has been reset.',
      progress
    });

  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ error: 'Server error while resetting progress.' });
  }
});

// Get today's problem
router.get('/todays-problem', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      // Create new progress record for user
      progress = new Progress({
        userId: req.user._id,
        currentStreak: 0,
        todaysProblemStreak: 0,
        longestStreak: 0,
        longestTodaysProblemStreak: 0,
        totalProblemsSolved: 0,
        currentRating: 1200
      });
      await progress.save();
    }

    // Get today's date for consistent daily problem selection
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const year = today.getFullYear();
    
    // Create a unique seed for today using year and day of year
    const todaySeed = year * 1000 + dayOfYear;
    
    // Get all problems from ProblemBank (main problem bank)
    const allProblems = await ProblemBank.find({});
    
    if (allProblems.length === 0) {
      return res.status(404).json({ message: 'No problems available in problem bank' });
    }

    // Use today's seed to consistently select the same problem for everyone today
    const randomIndex = todaySeed % allProblems.length;
    const todaysProblem = allProblems[randomIndex];
    
    if (!todaysProblem) {
      return res.status(404).json({ message: 'Today\'s problem not found' });
    }

    // Check if user has already solved today's problem
    const solvedToday = await Problem.findOne({
      userId: req.user._id,
      problemId: todaysProblem.problemId,
      status: 'solved',
      solvedAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
      }
    });

    // Check if user solved a problem yesterday to maintain streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const solvedYesterday = await Problem.findOne({
      userId: req.user._id,
      status: 'solved',
      solvedAt: {
        $gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate())
      }
    });

    // Update streak logic - reset streak if user hasn't solved today's problem yet
    if (!solvedToday) {
      // If user hasn't solved today's problem, streak should be 0
      progress.todaysProblemStreak = 0;
      await progress.save();
    }

    res.json({
      todaysProblem: {
        problemId: todaysProblem.problemId,
        title: todaysProblem.title,
        difficulty: todaysProblem.difficulty,
        topics: todaysProblem.topics,
        problemUrl: todaysProblem.problemUrl,
        description: todaysProblem.description || '',
        examples: todaysProblem.examples || [],
        constraints: todaysProblem.constraints || [],
        hints: todaysProblem.hints || [],
        approach: todaysProblem.approach || '',
        currentDay: dayOfYear,
        totalDays: 365, // Days in a year
        isSolved: !!solvedToday
      },
      streak: {
        currentStreak: progress.currentStreak,
        todaysProblemStreak: progress.todaysProblemStreak,
        longestStreak: progress.longestStreak,
        longestTodaysProblemStreak: progress.longestTodaysProblemStreak
      }
    });
  } catch (error) {
    console.error('Error getting today\'s problem:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark today's problem as solved
router.post('/todays-problem/solve', auth, async (req, res) => {
  try {
    const { problemId, solution, language, timeSpent, notes } = req.body;

    // Get today's problem from ProblemBank (main problem bank)
    const todaysProblem = await ProblemBank.findOne({ problemId });
    
    if (!todaysProblem) {
      return res.status(404).json({ error: 'Today\'s problem not found.' });
    }

    // Check if already solved today
    const today = new Date();
    const existingProblem = await Problem.findOne({
      userId: req.user._id,
      problemId: problemId,
      status: 'solved',
      solvedAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
      }
    });

    if (existingProblem) {
      return res.status(400).json({ error: 'Today\'s problem already solved.' });
    }

    // Create solved problem record
    const solvedProblem = new Problem({
      userId: req.user._id,
      title: todaysProblem.title,
      platform: 'leetcode',
      problemId: todaysProblem.problemId,
      problemUrl: todaysProblem.problemUrl,
      difficulty: todaysProblem.difficulty,
      topics: todaysProblem.topics,
      solution: {
        language: language || 'python',
        code: solution || '',
        submissionTime: new Date()
      },
      timeSpent: timeSpent || 0,
      notes: notes || '',
      status: 'solved',
      solvedAt: new Date()
    });

    await solvedProblem.save();

    // Update progress
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }

    // For today's problems, we only count the first submission of the day
    // The existingProblem check above already ensures this is the first submission today
    // So we can safely update progress stats

    // Update topic progress
    todaysProblem.topics.forEach(topic => {
      if (progress.topicProgress[topic] !== undefined) {
        progress.topicProgress[topic] += 1;
      }
    });

    // Update difficulty progress
    if (progress.difficultyProgress[todaysProblem.difficulty] !== undefined) {
      progress.difficultyProgress[todaysProblem.difficulty] += 1;
    }

    // Update rating based on difficulty
    const ratingChange = todaysProblem.difficulty === 'easy' ? 10 : todaysProblem.difficulty === 'medium' ? 20 : 30;
    progress.currentRating += ratingChange;
    
    if (progress.currentRating > progress.highestRating) {
      progress.highestRating = progress.currentRating;
    }

    // Update today's problem streak
    const lastActivity = progress.lastActivityDate ? new Date(progress.lastActivityDate) : null;
    
    // Check if it's a new day
    if (!lastActivity || today.toDateString() !== lastActivity.toDateString()) {
      const diffTime = lastActivity ? Math.abs(today - lastActivity) : 0;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - streak continues
        progress.currentStreak += 1;
        progress.todaysProblemStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1 for today
        progress.currentStreak = 1;
        progress.todaysProblemStreak = 1;
      } else {
        // First time solving - start streak at 1
        progress.currentStreak = 1;
        progress.todaysProblemStreak = 1;
      }
    } else {
      // Same day - maintain current streak (don't increment)
      // This ensures streak only increases once per day
    }
    
    // Update longest streaks
    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }
    if (progress.todaysProblemStreak > progress.longestTodaysProblemStreak) {
      progress.longestTodaysProblemStreak = progress.todaysProblemStreak;
    }
    
    // Update last activity for streak
    progress.lastActivityDate = new Date();

    await progress.save();

    res.json({
      message: 'Today\'s problem solved successfully!',
      problem: solvedProblem,
      progress: {
        currentStreak: progress.currentStreak,
        todaysProblemStreak: progress.todaysProblemStreak,
        longestStreak: progress.longestStreak,
        longestTodaysProblemStreak: progress.longestTodaysProblemStreak,
        currentRating: progress.currentRating
      }
    });

  } catch (error) {
    console.error('Solve today\'s problem error:', error);
    res.status(500).json({ error: 'Server error while solving today\'s problem.' });
  }
});

module.exports = router; 