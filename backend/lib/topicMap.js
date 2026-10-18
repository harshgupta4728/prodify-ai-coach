// Topic pages use slugs ("linked-lists"), while problems are tagged with the problem
// bank's topic names ("linkedLists"). This is the one place that maps between them.
const ProblemBank = require('../models/ProblemBank');

const PROBLEM_TOPICS = ProblemBank.schema.path('topics').caster.enumValues;

const PRACTICE_TOPICS = {
  'linked-lists': ['linkedLists'],
  'stack-queue': ['stack', 'queue'],
  'dynamic-programming': ['dynamicProgramming'],
  'binary-search': ['binarySearch'],
  'two-pointers': ['twoPointers'],
  'sliding-window': ['slidingWindow'],
  // No problems in the bank are tagged with these yet
  hashing: [],
  sorting: [],
};

// Problem-bank topic names for a topic slug (also accepts a bank topic name directly)
const practiceTopicsFor = (slugOrTopic) =>
  PRACTICE_TOPICS[slugOrTopic] ?? (PROBLEM_TOPICS.includes(slugOrTopic) ? [slugOrTopic] : []);

module.exports = { practiceTopicsFor };
