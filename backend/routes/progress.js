const express = require('express');
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const ProblemBank = require('../models/ProblemBank');
const TodaysProblemBank = require('../models/TodaysProblemBank');
const auth = require('../middleware/auth');
const { firstTooLong, isNonEmptyString, toBoundedInt } = require('../lib/validate');
const { timeZoneOf, dayKey, countStreak, dayOfYear } = require('../lib/days');
const { practiceTopicsFor } = require('../lib/topicMap');

const router = express.Router();

// Streaks are worked out from the solve history (in the user's timezone) instead of
// being counted up and down, so opening the app never changes them and they can't drift.
//   currentStreak:       days in a row with at least one solved problem
//   todaysProblemStreak: days in a row the daily problem was solved
const applyStreaks = async (progress, userId, timeZone) => {
  const since = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
  const solves = await Problem.find({ userId, status: 'solved', solvedAt: { $gte: since } })
    .select('solvedAt isDailyProblem').lean();

  const solveDays = new Set();
  const dailyDays = new Set();
  for (const solve of solves) {
    const day = dayKey(solve.solvedAt, timeZone);
    solveDays.add(day);
    if (solve.isDailyProblem) dailyDays.add(day);
  }

  const today = dayKey(new Date(), timeZone);
  progress.currentStreak = countStreak(solveDays, today);
  progress.todaysProblemStreak = countStreak(dailyDays, today);
  progress.longestStreak = Math.max(progress.longestStreak || 0, progress.currentStreak);
  progress.longestTodaysProblemStreak = Math.max(progress.longestTodaysProblemStreak || 0, progress.todaysProblemStreak);
};

// The same problem for everyone on a given calendar day, rotating through the bank.
// No sort on purpose: natural order matches the original find({}) list, so the rotation is unchanged.
const findDailyProblem = async (day) => {
  const problemCount = await ProblemBank.countDocuments();
  if (problemCount === 0) return null;
  const seed = Number(day.slice(0, 4)) * 1000 + dayOfYear(day);
  return ProblemBank.findOne().skip(seed % problemCount);
};

// Whether the user solved this problem on the given day (in their timezone)
const solvedOnDay = async (userId, problemId, day, timeZone) => {
  const recent = await Problem.find({
    userId,
    problemId,
    status: 'solved',
    solvedAt: { $gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  }).select('solvedAt').lean();
  return recent.some((solve) => dayKey(solve.solvedAt, timeZone) === day);
};

const SUBMISSION_LIMITS = { code: 50000, solution: 50000, notes: 5000, title: 300, problemUrl: 2048 };
// Topic slugs and subtopic ids become keys in the progress document
const KEY_PATTERN = /^[\w-]{1,100}$/;
const MAX_TRACKED_KEYS = 200;
const MAX_ARTICLES_READ = 2000;

const pagination = (query) => ({
  page: toBoundedInt(query.page, { min: 1, max: 10000, fallback: 1 }),
  limit: toBoundedInt(query.limit, { min: 1, max: 100, fallback: 10 })
});

// Get user's progress
router.get('/', auth, async (req, res) => {
  try {
    // Created with defaults (streak 0, rating 1200) the first time
    const progress = await Progress.forUser(req.user._id);

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
    await applyStreaks(progress, req.user._id, timeZoneOf(req));

    await progress.save();

    res.json({
      progress: {
        // flattenMaps: quizScores / interviewQuestionsViewed are Maps, which JSON can't carry
        ...progress.toObject({ flattenMaps: true }),
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

    if (!isNonEmptyString(problemId, 100) || !Array.isArray(topics)) {
      return res.status(400).json({ error: 'problemId and a topics array are required.' });
    }
    const tooLong = firstTooLong({ code, notes, title, problemUrl }, SUBMISSION_LIMITS);
    if (tooLong) {
      return res.status(400).json({ error: `${tooLong} is too long.` });
    }

    // Must be checked before the new submission is saved, or it always finds that one
    const isFirstTimeSolving = !(await Problem.exists({
      userId: req.user._id,
      platform,
      problemId
    }));

    // Allow multiple submissions for the same problem
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
    const progress = await Progress.forUser(req.user._id);

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

    await applyStreaks(progress, req.user._id, timeZoneOf(req));
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
        title: progress.currentStreak > 0 ? 'Build Your Streak' : 'Start a Streak',
        description: progress.currentStreak > 0
          ? `You're on a ${progress.currentStreak}-day streak! Keep going to reach 7 days.`
          : 'Solve one problem today to start a streak, then come back tomorrow to grow it.',
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
    
    const progress = await Progress.forUser(req.user._id);

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
    const { topic, difficulty, platform } = req.query;
    const { page, limit } = pagination(req.query);

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
    const { topic, difficulty } = req.query;
    const { page, limit } = pagination(req.query);

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

    // Accepts a topic page slug ("linked-lists") as well as a problem-bank topic ("linkedLists")
    const problems = await ProblemBank.find({ topics: { $in: practiceTopicsFor(topic) } })
      .sort({ orderInTopic: 1, difficulty: 1 });

    // Get user's solved problems for this topic
    const userSolvedProblems = await Problem.find({
      userId: req.user._id,
      status: 'solved'
    }).select('problemId');

    const solvedProblemIds = new Set(userSolvedProblems.map(p => p.problemId));

    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.has(problem.problemId)
    }));

    res.json({
      problems: problemsWithStatus,
      topic,
      totalProblems: problems.length,
      solvedProblems: problemsWithStatus.filter(p => p.isSolved).length
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

    if (!isNonEmptyString(problemId, 100)) {
      return res.status(400).json({ error: 'problemId is required.' });
    }
    const tooLong = firstTooLong({ solution, notes }, SUBMISSION_LIMITS);
    if (tooLong) {
      return res.status(400).json({ error: `${tooLong} is too long.` });
    }

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

    // Must be checked before the new submission is saved, or it always finds that one
    const isFirstTimeSolving = !(await Problem.exists({
      userId: req.user._id,
      problemId: problemId
    }));

    // Allow multiple submissions for the same problem
    // No need to check if already solved - just create a new submission

    // Create solved problem record
    const solvedProblem = new Problem({
      userId: req.user._id,
      title: problemBank.title,
      platform: problemBank.platform || 'prodify',
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

    // Solving today's problem from a topic page still counts towards the daily streak
    const timeZone = timeZoneOf(req);
    const dailyProblem = await findDailyProblem(dayKey(new Date(), timeZone));
    solvedProblem.isDailyProblem = dailyProblem?.problemId === solvedProblem.problemId;

    await solvedProblem.save();

    // Update progress
    const progress = await Progress.forUser(req.user._id);

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

    await applyStreaks(progress, req.user._id, timeZoneOf(req));
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
    const progress = await Progress.forUser(req.user._id);
    
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
    // "Today" is the user's own calendar day, so the problem changes at their midnight
    const timeZone = timeZoneOf(req);
    const today = dayKey(new Date(), timeZone);

    const todaysProblem = await findDailyProblem(today);
    if (!todaysProblem) {
      return res.status(404).json({ message: 'No problems available in problem bank' });
    }

    const solvedToday = await solvedOnDay(req.user._id, todaysProblem.problemId, today, timeZone);

    // Created with defaults (streaks 0, rating 1200) the first time
    const progress = await Progress.forUser(req.user._id);
    await applyStreaks(progress, req.user._id, timeZone);
    await progress.save();

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
        currentDay: dayOfYear(today),
        totalDays: 365, // Days in a year
        isSolved: solvedToday
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

    if (!isNonEmptyString(problemId, 100)) {
      return res.status(400).json({ error: 'problemId is required.' });
    }
    const tooLong = firstTooLong({ solution, notes }, SUBMISSION_LIMITS);
    if (tooLong) {
      return res.status(400).json({ error: `${tooLong} is too long.` });
    }

    const timeZone = timeZoneOf(req);
    const today = dayKey(new Date(), timeZone);

    // Only today's problem counts towards the daily streak
    const todaysProblem = await findDailyProblem(today);
    if (!todaysProblem) {
      return res.status(404).json({ error: 'Today\'s problem not found.' });
    }
    if (todaysProblem.problemId !== problemId) {
      return res.status(400).json({ error: 'Today\'s problem has changed. Refresh the page to get the new one.' });
    }

    if (await solvedOnDay(req.user._id, problemId, today, timeZone)) {
      return res.status(400).json({ error: 'Today\'s problem already solved.' });
    }

    // Create solved problem record
    const solvedProblem = new Problem({
      userId: req.user._id,
      title: todaysProblem.title,
      platform: 'prodify',
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
      isDailyProblem: true,
      solvedAt: new Date()
    });

    await solvedProblem.save();

    // Update progress
    const progress = await Progress.forUser(req.user._id);

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

    await applyStreaks(progress, req.user._id, timeZone);
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

// ============ QUIZ / ARTICLE / INTERVIEW TRACKING ============

// Save quiz score for a topic
router.post('/quiz-score', auth, async (req, res) => {
  try {
    const { topicSlug, score, totalQuestions } = req.body;
    if (!topicSlug || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'topicSlug, score, and totalQuestions are required.' });
    }
    if (typeof topicSlug !== 'string' || !KEY_PATTERN.test(topicSlug) ||
        !Number.isInteger(score) || !Number.isInteger(totalQuestions) ||
        score < 0 || totalQuestions < 1 || totalQuestions > 1000 || score > totalQuestions) {
      return res.status(400).json({ error: 'Invalid quiz score.' });
    }

    const progress = await Progress.forUser(req.user._id);

    if (!progress.quizScores.has(topicSlug) && progress.quizScores.size >= MAX_TRACKED_KEYS) {
      return res.status(400).json({ error: 'Too many quiz topics tracked.' });
    }

    const existing = progress.quizScores.get(topicSlug);
    const newEntry = {
      bestScore: existing ? Math.max(existing.bestScore, score) : score,
      totalQuestions,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: new Date()
    };
    progress.quizScores.set(topicSlug, newEntry);
    await progress.save();

    res.json({ message: 'Quiz score saved.', quizScore: newEntry });
  } catch (error) {
    console.error('Save quiz score error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Mark article/subtopic as read
router.patch('/article-read', auth, async (req, res) => {
  try {
    const { topicSlug, subtopicId } = req.body;
    if (!topicSlug || !subtopicId) {
      return res.status(400).json({ error: 'topicSlug and subtopicId are required.' });
    }
    if (typeof topicSlug !== 'string' || typeof subtopicId !== 'string' ||
        !KEY_PATTERN.test(topicSlug) || !KEY_PATTERN.test(subtopicId)) {
      return res.status(400).json({ error: 'Invalid topicSlug or subtopicId.' });
    }

    const progress = await Progress.forUser(req.user._id);

    // Deduplicate
    const alreadyRead = progress.articlesRead.some(
      a => a.topicSlug === topicSlug && a.subtopicId === subtopicId
    );
    if (!alreadyRead && progress.articlesRead.length < MAX_ARTICLES_READ) {
      progress.articlesRead.push({ topicSlug, subtopicId, readAt: new Date() });
      await progress.save();
    }

    res.json({ message: 'Article marked as read.', articlesRead: progress.articlesRead });
  } catch (error) {
    console.error('Mark article read error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Track interview questions viewed
router.patch('/interview-viewed', auth, async (req, res) => {
  try {
    const { topicSlug, count } = req.body;
    if (!topicSlug) {
      return res.status(400).json({ error: 'topicSlug is required.' });
    }
    if (typeof topicSlug !== 'string' || !KEY_PATTERN.test(topicSlug) ||
        (count !== undefined && (!Number.isInteger(count) || count < 0 || count > 100000))) {
      return res.status(400).json({ error: 'Invalid topicSlug or count.' });
    }

    const progress = await Progress.forUser(req.user._id);

    if (!progress.interviewQuestionsViewed.has(topicSlug) && progress.interviewQuestionsViewed.size >= MAX_TRACKED_KEYS) {
      return res.status(400).json({ error: 'Too many topics tracked.' });
    }

    progress.interviewQuestionsViewed.set(topicSlug, count || 0);
    await progress.save();

    res.json({ message: 'Interview viewed count updated.', interviewQuestionsViewed: Object.fromEntries(progress.interviewQuestionsViewed) });
  } catch (error) {
    console.error('Track interview viewed error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;