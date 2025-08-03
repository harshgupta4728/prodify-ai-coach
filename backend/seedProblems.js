const mongoose = require('mongoose');
const ProblemBank = require('./models/ProblemBank');
require('dotenv').config();

const problems = [
  // ARRAYS - 5 problems
  {
    title: "Two Sum",
    problemId: "LC_1",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/two-sum/",
    difficulty: "easy",
    topics: ["arrays", "twoPointers"],
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: ["2 <= nums.length <= 104", "-109 <= nums[i] <= 109", "-109 <= target <= 109"],
    hints: ["Use a hash map to store complements", "Check if target - current number exists in map"],
    approach: "Use a hash map to store each number and its index. For each number, check if target - number exists in the map.",
    acceptanceRate: 85,
    frequency: 95,
    orderInTopic: 1,
    tags: ["hash-table", "array"]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    problemId: "LC_121",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    difficulty: "easy",
    topics: ["arrays", "greedy"],
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      }
    ],
    constraints: ["1 <= prices.length <= 105", "0 <= prices[i] <= 104"],
    hints: ["Keep track of minimum price seen so far", "Update max profit if current price - min price is greater"],
    approach: "Keep track of the minimum price seen so far and update the maximum profit if selling at current price gives better profit.",
    acceptanceRate: 78,
    frequency: 90,
    orderInTopic: 2,
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Maximum Subarray",
    problemId: "LC_53",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/maximum-subarray/",
    difficulty: "medium",
    topics: ["arrays", "dynamicProgramming"],
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      }
    ],
    constraints: ["1 <= nums.length <= 105", "-104 <= nums[i] <= 104"],
    hints: ["Use Kadane's algorithm", "Keep track of current sum and max sum"],
    approach: "Use Kadane's algorithm: keep track of current sum and maximum sum. If current sum becomes negative, reset it to 0.",
    acceptanceRate: 72,
    frequency: 88,
    orderInTopic: 3,
    tags: ["array", "divide-and-conquer", "dynamic-programming"]
  },
  {
    title: "Product of Array Except Self",
    problemId: "LC_238",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/product-of-array-except-self/",
    difficulty: "medium",
    topics: ["arrays", "twoPointers"],
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
    examples: [
      {
        input: "nums = [1,2,3,4]",
        output: "[24,12,8,6]",
        explanation: "answer[0] = 2*3*4 = 24, answer[1] = 1*3*4 = 12, etc."
      }
    ],
    constraints: ["2 <= nums.length <= 105", "-30 <= nums[i] <= 30"],
    hints: ["Use prefix and suffix products", "Calculate products from left and right"],
    approach: "Calculate prefix products from left to right, then multiply with suffix products from right to left.",
    acceptanceRate: 68,
    frequency: 85,
    orderInTopic: 4,
    tags: ["array", "prefix-sum"]
  },
  {
    title: "Container With Most Water",
    problemId: "LC_11",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/container-with-most-water/",
    difficulty: "medium",
    topics: ["arrays", "twoPointers", "greedy"],
    description: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis form a container that would hold the maximum amount of water.",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The maximum area is obtained by choosing height[1] = 8 and height[8] = 7."
      }
    ],
    constraints: ["n == height.length", "2 <= n <= 105", "0 <= height[i] <= 104"],
    hints: ["Use two pointers", "Move the pointer with smaller height"],
    approach: "Use two pointers at the ends. Calculate area and move the pointer with smaller height inward.",
    acceptanceRate: 65,
    frequency: 82,
    orderInTopic: 5,
    tags: ["array", "two-pointers", "greedy"]
  },

  // STRINGS - 5 problems
  {
    title: "Valid Parentheses",
    problemId: "LC_20",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "easy",
    topics: ["strings", "stack"],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "Simple valid parentheses."
      }
    ],
    constraints: ["1 <= s.length <= 104", "s consists of parentheses only '()[]{}'"],
    hints: ["Use a stack", "Push opening brackets, pop and match closing brackets"],
    approach: "Use a stack to keep track of opening brackets. When encountering a closing bracket, pop from stack and check if it matches.",
    acceptanceRate: 80,
    frequency: 92,
    orderInTopic: 1,
    tags: ["string", "stack"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    problemId: "LC_3",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "medium",
    topics: ["strings", "slidingWindow", "twoPointers"],
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      }
    ],
    constraints: ["0 <= s.length <= 5 * 104", "s consists of English letters, digits, symbols and spaces"],
    hints: ["Use sliding window", "Keep track of character positions"],
    approach: "Use sliding window with two pointers. Keep track of character positions and update window when duplicate found.",
    acceptanceRate: 75,
    frequency: 88,
    orderInTopic: 2,
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Longest Palindromic Substring",
    problemId: "LC_5",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
    difficulty: "medium",
    topics: ["strings", "dynamicProgramming"],
    description: "Given a string s, return the longest palindromic substring in s.",
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.'
      }
    ],
    constraints: ["1 <= s.length <= 1000", "s consist of only digits and English letters"],
    hints: ["Use dynamic programming", "Check all possible centers"],
    approach: "Use dynamic programming or expand around center approach to find the longest palindrome.",
    acceptanceRate: 70,
    frequency: 85,
    orderInTopic: 3,
    tags: ["string", "dynamic-programming"]
  },
  {
    title: "Group Anagrams",
    problemId: "LC_49",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/group-anagrams/",
    difficulty: "medium",
    topics: ["strings"],
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
        explanation: "Group strings that are anagrams of each other."
      }
    ],
    constraints: ["1 <= strs.length <= 104", "0 <= strs[i].length <= 100"],
    hints: ["Use sorted string as key", "Group by character count"],
    approach: "Use sorted string or character count as key to group anagrams together.",
    acceptanceRate: 75,
    frequency: 80,
    orderInTopic: 4,
    tags: ["array", "hash-table", "string", "sorting"]
  },
  {
    title: "Valid Anagram",
    problemId: "LC_242",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/valid-anagram/",
    difficulty: "easy",
    topics: ["strings"],
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
        explanation: "Both strings contain the same characters."
      }
    ],
    constraints: ["1 <= s.length, t.length <= 5 * 104", "s and t consist of lowercase English letters"],
    hints: ["Count characters", "Compare character frequencies"],
    approach: "Count characters in both strings and compare the frequencies.",
    acceptanceRate: 85,
    frequency: 78,
    orderInTopic: 5,
    tags: ["hash-table", "string", "sorting"]
  },

  // LINKED LISTS - 5 problems
  {
    title: "Reverse Linked List",
    problemId: "LC_206",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/reverse-linked-list/",
    difficulty: "easy",
    topics: ["linkedLists"],
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "Reverse the linked list."
      }
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000]", "-5000 <= Node.val <= 5000"],
    hints: ["Use three pointers", "Iteratively reverse the links"],
    approach: "Use three pointers (prev, curr, next) to iteratively reverse the links.",
    acceptanceRate: 82,
    frequency: 90,
    orderInTopic: 1,
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Detect Cycle in Linked List",
    problemId: "LC_141",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/linked-list-cycle/",
    difficulty: "easy",
    topics: ["linkedLists", "twoPointers"],
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
        explanation: "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed)."
      }
    ],
    constraints: ["The number of the nodes in the list is in the range [0, 104]", "-105 <= Node.val <= 105"],
    hints: ["Use Floyd's cycle detection", "Fast and slow pointers"],
    approach: "Use Floyd's cycle detection algorithm with fast and slow pointers.",
    acceptanceRate: 78,
    frequency: 85,
    orderInTopic: 2,
    tags: ["hash-table", "linked-list", "two-pointers"]
  },
  {
    title: "Merge Two Sorted Lists",
    problemId: "LC_21",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    difficulty: "easy",
    topics: ["linkedLists"],
    description: "Merge two sorted linked lists and return it as a sorted list.",
    examples: [
      {
        input: "l1 = [1,2,4], l2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "Merge the two sorted lists."
      }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50]", "-100 <= Node.val <= 100"],
    hints: ["Use dummy node", "Compare and link nodes"],
    approach: "Use a dummy node and compare nodes from both lists, linking the smaller one.",
    acceptanceRate: 80,
    frequency: 88,
    orderInTopic: 3,
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Remove Nth Node From End of List",
    problemId: "LC_19",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    difficulty: "medium",
    topics: ["linkedLists", "twoPointers"],
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    examples: [
      {
        input: "head = [1,2,3,4,5], n = 2",
        output: "[1,2,3,5]",
        explanation: "Remove the 2nd node from the end."
      }
    ],
    constraints: ["The number of nodes in the list is sz", "1 <= sz <= 30", "0 <= Node.val <= 100"],
    hints: ["Use two pointers", "Fast pointer moves n steps ahead"],
    approach: "Use two pointers. Move fast pointer n steps ahead, then move both pointers until fast reaches end.",
    acceptanceRate: 75,
    frequency: 82,
    orderInTopic: 4,
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Add Two Numbers",
    problemId: "LC_2",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/add-two-numbers/",
    difficulty: "medium",
    topics: ["linkedLists", "math"],
    description: "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      }
    ],
    constraints: ["The number of nodes in each linked list is in the range [1, 100]", "0 <= Node.val <= 9"],
    hints: ["Simulate addition", "Handle carry"],
    approach: "Simulate addition digit by digit, handling carry and creating new nodes for the result.",
    acceptanceRate: 70,
    frequency: 85,
    orderInTopic: 5,
    tags: ["linked-list", "math", "recursion"]
  },

  // TREES - 5 problems
  {
    title: "Maximum Depth of Binary Tree",
    problemId: "LC_104",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    difficulty: "easy",
    topics: ["trees"],
    description: "Given the root of a binary tree, return its maximum depth.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
        explanation: "The maximum depth is 3."
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 104]", "-100 <= Node.val <= 100"],
    hints: ["Use recursion", "Return 1 + max(left, right)"],
    approach: "Use recursion to find the maximum depth of left and right subtrees, then return 1 + max of them.",
    acceptanceRate: 85,
    frequency: 90,
    orderInTopic: 1,
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"]
  },
  {
    title: "Validate Binary Search Tree",
    problemId: "LC_98",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    difficulty: "medium",
    topics: ["trees", "binarySearch"],
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    examples: [
      {
        input: "root = [2,1,3]",
        output: "true",
        explanation: "Valid BST."
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 104]", "-231 <= Node.val <= 231 - 1"],
    hints: ["Use inorder traversal", "Check if values are in ascending order"],
    approach: "Use inorder traversal to check if values are in ascending order, or use recursion with min/max bounds.",
    acceptanceRate: 75,
    frequency: 85,
    orderInTopic: 2,
    tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"]
  },
  {
    title: "Binary Tree Level Order Traversal",
    problemId: "LC_102",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    difficulty: "medium",
    topics: ["trees"],
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "Level order traversal."
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000]", "-1000 <= Node.val <= 1000"],
    hints: ["Use BFS with queue", "Process level by level"],
    approach: "Use BFS with a queue to process nodes level by level.",
    acceptanceRate: 80,
    frequency: 88,
    orderInTopic: 3,
    tags: ["tree", "breadth-first-search", "binary-tree"]
  },
  {
    title: "Invert Binary Tree",
    problemId: "LC_226",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/invert-binary-tree/",
    difficulty: "easy",
    topics: ["trees"],
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    examples: [
      {
        input: "root = [4,2,7,1,3,6,9]",
        output: "[4,7,2,9,6,3,1]",
        explanation: "Invert the binary tree."
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100]", "-100 <= Node.val <= 100"],
    hints: ["Use recursion", "Swap left and right children"],
    approach: "Use recursion to swap left and right children of each node.",
    acceptanceRate: 85,
    frequency: 82,
    orderInTopic: 4,
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"]
  },
  {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    problemId: "LC_235",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    difficulty: "medium",
    topics: ["trees", "binarySearch"],
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) of two given nodes in the BST.",
    examples: [
      {
        input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8",
        output: "6",
        explanation: "The LCA of nodes 2 and 8 is 6."
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [2, 105]", "-109 <= Node.val <= 109"],
    hints: ["Use BST property", "If both nodes are on same side, go that way"],
    approach: "Use BST property: if both nodes are on the same side of current node, go that way; otherwise current node is LCA.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 5,
    tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"]
  }
];

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodify-ai-coach');
    console.log('Connected to MongoDB');

    // Clear existing problems
    await ProblemBank.deleteMany({});
    console.log('Cleared existing problems');

    // Insert new problems
    const result = await ProblemBank.insertMany(problems);
    console.log(`Successfully seeded ${result.length} problems`);

    // Log problems by topic
    const topics = ['arrays', 'strings', 'linkedLists', 'trees'];
    for (const topic of topics) {
      const count = await ProblemBank.countDocuments({ topics: topic });
      console.log(`${topic}: ${count} problems`);
    }

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding problems:', error);
    process.exit(1);
  }
}

seedProblems(); 