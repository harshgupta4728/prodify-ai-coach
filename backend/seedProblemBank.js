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
  },

  // GRAPHS - 5 problems
  {
    title: "Number of Islands",
    problemId: "LC_200",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "medium",
    topics: ["graphs"],
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: "1",
        explanation: "One island surrounded by water."
      }
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'"],
    hints: ["Use DFS or BFS", "Mark visited cells"],
    approach: "Use DFS or BFS to explore each island. Mark visited cells to avoid counting the same island multiple times.",
    acceptanceRate: 75,
    frequency: 85,
    orderInTopic: 1,
    tags: ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"]
  },
  {
    title: "Clone Graph",
    problemId: "LC_133",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/clone-graph/",
    difficulty: "medium",
    topics: ["graphs"],
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
    examples: [
      {
        input: "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        output: "[[2,4],[1,3],[2,4],[1,3]]",
        explanation: "Clone the graph structure."
      }
    ],
    constraints: ["The number of nodes in the graph is in the range [0, 100]", "1 <= Node.val <= 100"],
    hints: ["Use DFS or BFS", "Keep track of visited nodes"],
    approach: "Use DFS or BFS to traverse the graph. Create new nodes and maintain a mapping between original and cloned nodes.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 2,
    tags: ["hash-table", "depth-first-search", "breadth-first-search", "graph"]
  },
  {
    title: "Course Schedule",
    problemId: "LC_207",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/course-schedule/",
    difficulty: "medium",
    topics: ["graphs"],
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "You can take course 1 after course 0."
      }
    ],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2"],
    hints: ["Use topological sort", "Detect cycles"],
    approach: "Use topological sort with DFS or BFS to detect cycles. If there's a cycle, it's impossible to complete all courses.",
    acceptanceRate: 65,
    frequency: 75,
    orderInTopic: 3,
    tags: ["depth-first-search", "breadth-first-search", "graph", "topological-sort"]
  },
  {
    title: "Pacific Atlantic Water Flow",
    problemId: "LC_417",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    difficulty: "medium",
    topics: ["graphs"],
    description: "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.",
    examples: [
      {
        input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        explanation: "Cells that can flow to both oceans."
      }
    ],
    constraints: ["m == heights.length", "n == heights[r].length", "1 <= m, n <= 200", "0 <= heights[r][c] <= 105"],
    hints: ["Start from ocean edges", "Use DFS from both oceans"],
    approach: "Start DFS from Pacific and Atlantic edges separately. Cells that can be reached from both oceans are the answer.",
    acceptanceRate: 60,
    frequency: 70,
    orderInTopic: 4,
    tags: ["array", "depth-first-search", "breadth-first-search", "matrix"]
  },
  {
    title: "Redundant Connection",
    problemId: "LC_684",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/redundant-connection/",
    difficulty: "medium",
    topics: ["graphs"],
    description: "In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added.",
    examples: [
      {
        input: "edges = [[1,2],[1,3],[2,3]]",
        output: "[2,3]",
        explanation: "The edge [2,3] creates a cycle."
      }
    ],
    constraints: ["n == edges.length", "3 <= n <= 1000", "edges[i].length == 2", "1 <= ai < bi <= edges.length"],
    hints: ["Use Union Find", "Find the edge that creates a cycle"],
    approach: "Use Union Find data structure. The first edge that connects two already connected components creates a cycle.",
    acceptanceRate: 70,
    frequency: 75,
    orderInTopic: 5,
    tags: ["depth-first-search", "breadth-first-search", "union-find", "graph"]
  },

  // DYNAMIC PROGRAMMING - 5 problems
  {
    title: "Climbing Stairs",
    problemId: "LC_70",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/climbing-stairs/",
    difficulty: "easy",
    topics: ["dynamicProgramming"],
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: (1,1,1), (1,2), (2,1)."
      }
    ],
    constraints: ["1 <= n <= 45"],
    hints: ["Use DP", "dp[i] = dp[i-1] + dp[i-2]"],
    approach: "Use dynamic programming. dp[i] represents ways to climb i stairs. dp[i] = dp[i-1] + dp[i-2].",
    acceptanceRate: 85,
    frequency: 90,
    orderInTopic: 1,
    tags: ["math", "dynamic-programming", "memoization"]
  },
  {
    title: "House Robber",
    problemId: "LC_198",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/house-robber/",
    difficulty: "medium",
    topics: ["dynamicProgramming"],
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected.",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
        explanation: "Rob house 1 (money = 1) and then rob house 3 (money = 3)."
      }
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    hints: ["Use DP", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])"],
    approach: "Use dynamic programming. dp[i] represents max money robbed up to house i. dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
    acceptanceRate: 75,
    frequency: 85,
    orderInTopic: 2,
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Longest Increasing Subsequence",
    problemId: "LC_300",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
    difficulty: "medium",
    topics: ["dynamicProgramming"],
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    examples: [
      {
        input: "nums = [10,9,2,5,3,7,101,18]",
        output: "4",
        explanation: "The longest increasing subsequence is [2,3,7,101], therefore the length is 4."
      }
    ],
    constraints: ["1 <= nums.length <= 2500", "-104 <= nums[i] <= 104"],
    hints: ["Use DP", "For each element, check all previous elements"],
    approach: "Use dynamic programming. For each element, check all previous elements and update the LIS length.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 3,
    tags: ["array", "binary-search", "dynamic-programming"]
  },
  {
    title: "Coin Change",
    problemId: "LC_322",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/coin-change/",
    difficulty: "medium",
    topics: ["dynamicProgramming"],
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1"
      }
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 231 - 1", "0 <= amount <= 104"],
    hints: ["Use DP", "dp[i] = min(dp[i], dp[i-coin] + 1)"],
    approach: "Use dynamic programming. dp[i] represents minimum coins needed for amount i. dp[i] = min(dp[i], dp[i-coin] + 1) for each coin.",
    acceptanceRate: 65,
    frequency: 75,
    orderInTopic: 4,
    tags: ["array", "dynamic-programming", "breadth-first-search"]
  },
  {
    title: "Word Break",
    problemId: "LC_139",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/word-break/",
    difficulty: "medium",
    topics: ["dynamicProgramming"],
    description: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet","code"]',
        output: "true",
        explanation: "Return true because 'leetcode' can be segmented as 'leet code'."
      }
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20"],
    hints: ["Use DP", "Check all possible prefixes"],
    approach: "Use dynamic programming. dp[i] represents if s[0...i] can be segmented. Check all possible prefixes ending at i.",
    acceptanceRate: 60,
    frequency: 70,
    orderInTopic: 5,
    tags: ["hash-table", "string", "dynamic-programming", "trie", "memoization"]
  },

  // GREEDY - 5 problems
  {
    title: "Jump Game",
    problemId: "LC_55",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/jump-game/",
    difficulty: "medium",
    topics: ["greedy"],
    description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.",
    examples: [
      {
        input: "nums = [2,3,1,1,4]",
        output: "true",
        explanation: "Jump 1 step from index 0 to 1, then 3 steps to the last index."
      }
    ],
    constraints: ["1 <= nums.length <= 104", "0 <= nums[i] <= 105"],
    hints: ["Track the maximum reachable position", "If current position > max reachable, return false"],
    approach: "Track the maximum reachable position. If at any point current position exceeds max reachable, return false.",
    acceptanceRate: 75,
    frequency: 85,
    orderInTopic: 1,
    tags: ["array", "dynamic-programming", "greedy"]
  },
  {
    title: "Gas Station",
    problemId: "LC_134",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/gas-station/",
    difficulty: "medium",
    topics: ["greedy"],
    description: "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station.",
    examples: [
      {
        input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        output: "3",
        explanation: "Start at station 3 (index 3) and fill up with 4 unit of gas."
      }
    ],
    constraints: ["n == gas.length == cost.length", "1 <= n <= 105", "0 <= gas[i], cost[i] <= 104"],
    hints: ["If total gas < total cost, impossible", "Track cumulative gas - cost"],
    approach: "If total gas < total cost, return -1. Otherwise, find the starting point where cumulative gas - cost never becomes negative.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 2,
    tags: ["array", "greedy"]
  },
  {
    title: "Task Scheduler",
    problemId: "LC_621",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/task-scheduler/",
    difficulty: "medium",
    topics: ["greedy"],
    description: "Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time.",
    examples: [
      {
        input: 'tasks = ["A","A","A","B","B","B"], n = 2',
        output: "8",
        explanation: "A -> B -> idle -> A -> B -> idle -> A -> B"
      }
    ],
    constraints: ["1 <= tasks.length <= 104", "tasks[i] is upper-case English letter", "0 <= n <= 100"],
    hints: ["Count frequency of each task", "Use greedy approach with most frequent task"],
    approach: "Count frequency of each task. Use greedy approach: schedule most frequent task first, then others.",
    acceptanceRate: 65,
    frequency: 75,
    orderInTopic: 3,
    tags: ["array", "hash-table", "greedy", "sorting", "heap-priority-queue"]
  },
  {
    title: "Partition Labels",
    problemId: "LC_763",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/partition-labels/",
    difficulty: "medium",
    topics: ["greedy"],
    description: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.",
    examples: [
      {
        input: 's = "ababcbacadefegdehijhklij"',
        output: "[9,7,8]",
        explanation: "The partition is 'ababcbaca', 'defegde', 'hijhklij'."
      }
    ],
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters"],
    hints: ["Find last occurrence of each character", "Use greedy approach"],
    approach: "Find last occurrence of each character. Use greedy approach: extend partition until reaching the last occurrence of current character.",
    acceptanceRate: 80,
    frequency: 70,
    orderInTopic: 4,
    tags: ["hash-table", "string", "greedy", "two-pointers"]
  },
  {
    title: "Minimum Number of Arrows to Burst Balloons",
    problemId: "LC_452",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
    difficulty: "medium",
    topics: ["greedy"],
    description: "There are some spherical balloons taped onto a flat wall that represents the XY-plane. The balloons are represented as a 2D integer array points where points[i] = [xstart, xend] denotes a balloon whose horizontal diameter stretches between xstart and xend.",
    examples: [
      {
        input: "points = [[10,16],[2,8],[1,6],[7,12]]",
        output: "2",
        explanation: "One way is to shoot one arrow for example at x = 6 (bursting the balloons [2,8] and [1,6]) and another arrow at x = 11 (bursting the other two balloons)."
      }
    ],
    constraints: ["1 <= points.length <= 105", "points[i].length == 2", "-231 <= xstart < xend <= 231 - 1"],
    hints: ["Sort by end points", "Use greedy approach"],
    approach: "Sort balloons by end points. Use greedy approach: shoot arrow at end of first balloon, then skip all balloons that can be burst by this arrow.",
    acceptanceRate: 75,
    frequency: 65,
    orderInTopic: 5,
    tags: ["array", "greedy", "sorting"]
  },

  // BACKTRACKING - 5 problems
  {
    title: "Subsets",
    problemId: "LC_78",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/subsets/",
    difficulty: "medium",
    topics: ["backtracking"],
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set).",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        explanation: "All possible subsets."
      }
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All the numbers of nums are unique"],
    hints: ["Use backtracking", "For each element, choose to include or exclude"],
    approach: "Use backtracking. For each element, choose to include or exclude it in the current subset.",
    acceptanceRate: 80,
    frequency: 85,
    orderInTopic: 1,
    tags: ["array", "backtracking", "bit-manipulation"]
  },
  {
    title: "Combination Sum",
    problemId: "LC_39",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/combination-sum/",
    difficulty: "medium",
    topics: ["backtracking"],
    description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.",
    examples: [
      {
        input: "candidates = [2,3,6,7], target = 7",
        output: "[[2,2,3],[7]]",
        explanation: "2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times."
      }
    ],
    constraints: ["1 <= candidates.length <= 30", "1 <= candidates[i] <= 200", "All elements of candidates are distinct", "1 <= target <= 500"],
    hints: ["Use backtracking", "Try all combinations", "Avoid duplicates"],
    approach: "Use backtracking. Try all combinations of candidates, avoiding duplicates by using start index.",
    acceptanceRate: 75,
    frequency: 80,
    orderInTopic: 2,
    tags: ["array", "backtracking"]
  },
  {
    title: "Permutations",
    problemId: "LC_46",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/permutations/",
    difficulty: "medium",
    topics: ["backtracking"],
    description: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        explanation: "All possible permutations."
      }
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All the integers of nums are unique"],
    hints: ["Use backtracking", "Swap elements", "Use visited array"],
    approach: "Use backtracking with swapping or visited array. Generate all possible permutations by trying each element at each position.",
    acceptanceRate: 85,
    frequency: 75,
    orderInTopic: 3,
    tags: ["array", "backtracking"]
  },
  {
    title: "N-Queens",
    problemId: "LC_51",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/n-queens/",
    difficulty: "hard",
    topics: ["backtracking"],
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.",
    examples: [
      {
        input: "n = 4",
        output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
        explanation: "Two distinct solutions to the 4-queens puzzle."
      }
    ],
    constraints: ["1 <= n <= 9"],
    hints: ["Use backtracking", "Check diagonals and columns", "Use sets to track attacks"],
    approach: "Use backtracking. Place queens row by row, checking if current position is safe from attacks by previously placed queens.",
    acceptanceRate: 60,
    frequency: 70,
    orderInTopic: 4,
    tags: ["array", "backtracking"]
  },
  {
    title: "Sudoku Solver",
    problemId: "LC_37",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/sudoku-solver/",
    difficulty: "hard",
    topics: ["backtracking"],
    description: "Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy all of the following rules: Each of the digits 1-9 must occur exactly once in each row.",
    examples: [
      {
        input: 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]',
        output: '[["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]',
        explanation: "Solved Sudoku board."
      }
    ],
    constraints: ["board.length == 9", "board[i].length == 9", "board[i][j] is a digit or '.'"],
    hints: ["Use backtracking", "Check row, column, and box", "Try digits 1-9"],
    approach: "Use backtracking. For each empty cell, try digits 1-9 and check if valid. If valid, continue; if not, backtrack.",
    acceptanceRate: 55,
    frequency: 65,
    orderInTopic: 5,
    tags: ["array", "backtracking", "matrix"]
  },

  // BINARY SEARCH - 5 problems
  {
    title: "Binary Search",
    problemId: "LC_704",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/binary-search/",
    difficulty: "easy",
    topics: ["binarySearch"],
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      }
    ],
    constraints: ["1 <= nums.length <= 104", "-104 < nums[i], target < 104", "All the integers in nums are unique", "nums is sorted in ascending order"],
    hints: ["Use binary search", "Compare target with middle element"],
    approach: "Use binary search. Compare target with middle element, then search left or right half accordingly.",
    acceptanceRate: 90,
    frequency: 95,
    orderInTopic: 1,
    tags: ["array", "binary-search"]
  },
  {
    title: "Search in Rotated Sorted Array",
    problemId: "LC_33",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    difficulty: "medium",
    topics: ["binarySearch"],
    description: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length).",
    examples: [
      {
        input: "nums = [4,5,6,7,0,1,2], target = 0",
        output: "4",
        explanation: "0 is at index 4"
      }
    ],
    constraints: ["1 <= nums.length <= 5000", "-104 <= nums[i] <= 104", "All values of nums are unique", "nums is an ascending array that is possibly rotated"],
    hints: ["Use binary search", "Check which half is sorted", "Compare target with sorted half"],
    approach: "Use binary search. Check which half is sorted, then compare target with the sorted half to determine search direction.",
    acceptanceRate: 70,
    frequency: 85,
    orderInTopic: 2,
    tags: ["array", "binary-search"]
  },
  {
    title: "Find First and Last Position of Element in Sorted Array",
    problemId: "LC_34",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    difficulty: "medium",
    topics: ["binarySearch"],
    description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.",
    examples: [
      {
        input: "nums = [5,7,7,8,8,10], target = 8",
        output: "[3,4]",
        explanation: "8 appears at positions 3 and 4"
      }
    ],
    constraints: ["0 <= nums.length <= 105", "-109 <= nums[i] <= 109", "nums is a non-decreasing array", "-109 <= target <= 109"],
    hints: ["Use binary search twice", "Find first occurrence", "Find last occurrence"],
    approach: "Use binary search twice: once to find first occurrence, once to find last occurrence.",
    acceptanceRate: 65,
    frequency: 80,
    orderInTopic: 3,
    tags: ["array", "binary-search"]
  },
  {
    title: "Search a 2D Matrix",
    problemId: "LC_74",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/search-a-2d-matrix/",
    difficulty: "medium",
    topics: ["binarySearch"],
    description: "Write an efficient algorithm that searches for a value target in an m x n integer matrix matrix. This matrix has the following properties: Integers in each row are sorted from left to right.",
    examples: [
      {
        input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
        output: "true",
        explanation: "3 exists in the matrix"
      }
    ],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 100", "-104 <= matrix[i][j], target <= 104"],
    hints: ["Treat matrix as sorted array", "Use binary search", "Convert 2D to 1D"],
    approach: "Treat the matrix as a sorted array. Use binary search with row and column calculations.",
    acceptanceRate: 75,
    frequency: 75,
    orderInTopic: 4,
    tags: ["array", "binary-search", "matrix"]
  },
  {
    title: "Median of Two Sorted Arrays",
    problemId: "LC_4",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    difficulty: "hard",
    topics: ["binarySearch"],
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      }
    ],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"],
    hints: ["Use binary search", "Find partition", "Compare elements around partition"],
    approach: "Use binary search to find the correct partition of both arrays such that all elements on left are smaller than all elements on right.",
    acceptanceRate: 55,
    frequency: 70,
    orderInTopic: 5,
    tags: ["array", "binary-search", "divide-and-conquer"]
  },

  // TWO POINTERS - 5 problems
  {
    title: "Two Sum II - Input Array Is Sorted",
    problemId: "LC_167",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    difficulty: "medium",
    topics: ["twoPointers"],
    description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.",
    examples: [
      {
        input: "numbers = [2,7,11,15], target = 9",
        output: "[1,2]",
        explanation: "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2]."
      }
    ],
    constraints: ["2 <= numbers.length <= 3 * 104", "-1000 <= numbers[i] <= 1000", "numbers is sorted in non-decreasing order", "-1000 <= target <= 1000"],
    hints: ["Use two pointers", "Start from ends", "Move pointer based on sum"],
    approach: "Use two pointers starting from both ends. Move left pointer if sum is too small, right pointer if sum is too large.",
    acceptanceRate: 80,
    frequency: 85,
    orderInTopic: 1,
    tags: ["array", "two-pointers", "binary-search"]
  },
  {
    title: "3Sum",
    problemId: "LC_15",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/3sum/",
    difficulty: "medium",
    topics: ["twoPointers"],
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "The triplets that sum to zero."
      }
    ],
    constraints: ["3 <= nums.length <= 3000", "-105 <= nums[i] <= 105"],
    hints: ["Sort array", "Use two pointers", "Avoid duplicates"],
    approach: "Sort array, then use two pointers for each fixed element. Avoid duplicates by skipping same elements.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 2,
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    title: "Trapping Rain Water",
    problemId: "LC_42",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/trapping-rain-water/",
    difficulty: "hard",
    topics: ["twoPointers"],
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped."
      }
    ],
    constraints: ["n == height.length", "1 <= n <= 2 * 104", "0 <= height[i] <= 105"],
    hints: ["Use two pointers", "Track left and right max", "Water trapped = min(leftMax, rightMax) - height[i]"],
    approach: "Use two pointers. Track left and right maximum heights. Water trapped at each position is min(leftMax, rightMax) - height[i].",
    acceptanceRate: 60,
    frequency: 75,
    orderInTopic: 3,
    tags: ["array", "two-pointers", "dynamic-programming", "stack", "monotonic-stack"]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    problemId: "LC_26",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    difficulty: "easy",
    topics: ["twoPointers"],
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.",
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "2",
        explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively."
      }
    ],
    constraints: ["1 <= nums.length <= 3 * 104", "-100 <= nums[i] <= 100", "nums is sorted in non-decreasing order"],
    hints: ["Use two pointers", "One for reading, one for writing", "Skip duplicates"],
    approach: "Use two pointers: one for reading, one for writing. Skip duplicates and write unique elements.",
    acceptanceRate: 85,
    frequency: 90,
    orderInTopic: 4,
    tags: ["array", "two-pointers"]
  },
  {
    title: "Sort Colors",
    problemId: "LC_75",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/sort-colors/",
    difficulty: "medium",
    topics: ["twoPointers"],
    description: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.",
    examples: [
      {
        input: "nums = [2,0,2,1,1,0]",
        output: "[0,0,1,1,2,2]",
        explanation: "Sort the colors in-place."
      }
    ],
    constraints: ["n == nums.length", "1 <= n <= 300", "nums[i] is either 0, 1, or 2"],
    hints: ["Use three pointers", "Dutch National Flag algorithm", "Partition into three sections"],
    approach: "Use Dutch National Flag algorithm with three pointers to partition array into three sections: 0s, 1s, and 2s.",
    acceptanceRate: 75,
    frequency: 80,
    orderInTopic: 5,
    tags: ["array", "two-pointers", "sorting"]
  },

  // SLIDING WINDOW - 5 problems
  {
    title: "Minimum Window Substring",
    problemId: "LC_76",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/minimum-window-substring/",
    difficulty: "hard",
    topics: ["slidingWindow"],
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    examples: [
      {
        input: 's = "ADOBECODEBANC", t = "ABC"',
        output: '"BANC"',
        explanation: "The minimum window substring 'BANC' includes 'A', 'B', and 'C' from string t."
      }
    ],
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 105", "s and t consist of uppercase and lowercase English letters"],
    hints: ["Use sliding window", "Track character counts", "Expand and contract window"],
    approach: "Use sliding window with two pointers. Expand window until all characters are found, then contract to find minimum.",
    acceptanceRate: 55,
    frequency: 70,
    orderInTopic: 1,
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    problemId: "LC_3",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "medium",
    topics: ["slidingWindow", "twoPointers"],
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      }
    ],
    constraints: ["0 <= s.length <= 5 * 104", "s consists of English letters, digits, symbols and spaces"],
    hints: ["Use sliding window", "Track character positions", "Update window when duplicate found"],
    approach: "Use sliding window with two pointers. Keep track of character positions and update window when duplicate found.",
    acceptanceRate: 75,
    frequency: 88,
    orderInTopic: 2,
    tags: ["hash-table", "string", "sliding-window"]
  },
  {
    title: "Sliding Window Maximum",
    problemId: "LC_239",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/sliding-window-maximum/",
    difficulty: "hard",
    topics: ["slidingWindow"],
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window.",
    examples: [
      {
        input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        output: "[3,3,5,5,6,7]",
        explanation: "Maximum values in each sliding window."
      }
    ],
    constraints: ["1 <= nums.length <= 105", "-104 <= nums[i] <= 104", "1 <= k <= nums.length"],
    hints: ["Use monotonic deque", "Keep track of maximum", "Remove elements outside window"],
    approach: "Use monotonic deque to keep track of maximum elements. Remove elements outside window and smaller elements.",
    acceptanceRate: 60,
    frequency: 75,
    orderInTopic: 3,
    tags: ["array", "queue", "sliding-window", "heap-priority-queue", "monotonic-queue"]
  },
  {
    title: "Permutation in String",
    problemId: "LC_567",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/permutation-in-string/",
    difficulty: "medium",
    topics: ["slidingWindow"],
    description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
    examples: [
      {
        input: 's1 = "ab", s2 = "eidbaooo"',
        output: "true",
        explanation: "s2 contains one permutation of s1 ('ba')."
      }
    ],
    constraints: ["1 <= s1.length, s2.length <= 104", "s1 and s2 consist of lowercase English letters"],
    hints: ["Use sliding window", "Compare character counts", "Window size equals s1 length"],
    approach: "Use sliding window of size s1.length. Compare character counts between window and s1.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 4,
    tags: ["hash-table", "two-pointers", "string", "sliding-window"]
  },
  {
    title: "Maximum Sum Subarray of Size K",
    problemId: "LC_643",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/maximum-average-subarray-i/",
    difficulty: "easy",
    topics: ["slidingWindow"],
    description: "You are given an integer array nums consisting of n elements, and an integer k. Find a contiguous subarray whose length is equal to k that has the maximum average value.",
    examples: [
      {
        input: "nums = [1,12,-5,-6,50,3], k = 4",
        output: "12.75000",
        explanation: "Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75"
      }
    ],
    constraints: ["n == nums.length", "1 <= k <= n <= 105", "-104 <= nums[i] <= 104"],
    hints: ["Use sliding window", "Calculate sum of first k elements", "Slide window and update sum"],
    approach: "Use sliding window. Calculate sum of first k elements, then slide window and update sum by adding new element and removing old element.",
    acceptanceRate: 80,
    frequency: 85,
    orderInTopic: 5,
    tags: ["array", "sliding-window"]
  },

  // STACK - 5 problems
  {
    title: "Valid Parentheses",
    problemId: "LC_20",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "easy",
    topics: ["stack"],
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
    title: "Min Stack",
    problemId: "LC_155",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/min-stack/",
    difficulty: "medium",
    topics: ["stack"],
    description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    examples: [
      {
        input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
        output: "[null,null,null,null,-3,null,0,-2]",
        explanation: "MinStack minStack = new MinStack(); minStack.push(-2); minStack.push(0); minStack.push(-3); minStack.getMin(); // return -3"
      }
    ],
    constraints: ["-231 <= val <= 231 - 1", "Methods pop, top and getMin operations will always be called on non-empty stacks", "At most 3 * 104 calls will be made to push, pop, top, and getMin"],
    hints: ["Use two stacks", "One for elements, one for minimums", "Track minimum at each step"],
    approach: "Use two stacks: one for elements, one for minimums. For each push, also push current minimum to min stack.",
    acceptanceRate: 75,
    frequency: 85,
    orderInTopic: 2,
    tags: ["stack", "design"]
  },
  {
    title: "Evaluate Reverse Polish Notation",
    problemId: "LC_150",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    difficulty: "medium",
    topics: ["stack"],
    description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /. Each operand may be an integer or another expression.",
    examples: [
      {
        input: 'tokens = ["2","1","+","3","*"]',
        output: "9",
        explanation: "((2 + 1) * 3) = 9"
      }
    ],
    constraints: ["1 <= tokens.length <= 104", "tokens[i] is either an operator: '+', '-', '*', or '/', or an integer in the range [-200, 200]"],
    hints: ["Use stack", "Push operands", "Pop and evaluate for operators"],
    approach: "Use stack. Push operands, when encountering operator, pop two operands, perform operation, and push result.",
    acceptanceRate: 70,
    frequency: 80,
    orderInTopic: 3,
    tags: ["array", "math", "stack"]
  },
  {
    title: "Daily Temperatures",
    problemId: "LC_739",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/daily-temperatures/",
    difficulty: "medium",
    topics: ["stack"],
    description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
    examples: [
      {
        input: "temperatures = [73,74,75,71,69,72,76,73]",
        output: "[1,1,4,2,1,1,0,0]",
        explanation: "For each day, find how many days until warmer temperature."
      }
    ],
    constraints: ["1 <= temperatures.length <= 105", "30 <= temperatures[i] <= 100"],
    hints: ["Use monotonic stack", "Keep track of indices", "Pop when warmer temperature found"],
    approach: "Use monotonic stack to keep track of indices. When finding warmer temperature, pop and calculate days difference.",
    acceptanceRate: 75,
    frequency: 75,
    orderInTopic: 4,
    tags: ["array", "stack", "monotonic-stack"]
  },
  {
    title: "Largest Rectangle in Histogram",
    problemId: "LC_84",
    platform: "leetcode",
    problemUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    difficulty: "hard",
    topics: ["stack"],
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    examples: [
      {
        input: "heights = [2,1,5,6,2,3]",
        output: "10",
        explanation: "The largest rectangle is shown in the red area, which has an area = 10 units."
      }
    ],
    constraints: ["1 <= heights.length <= 105", "0 <= heights[i] <= 104"],
    hints: ["Use monotonic stack", "Calculate area when popping", "Consider width from stack"],
    approach: "Use monotonic stack. When popping, calculate area using current height and width from stack position.",
    acceptanceRate: 55,
    frequency: 70,
    orderInTopic: 5,
    tags: ["array", "stack", "monotonic-stack"]
  }
];

async function seedProblemBank() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harshgupta4728:HgTg@4728@prodify.pafygw3.mongodb.net/?retryWrites=true&w=majority&appName=prodify');
    console.log('Connected to MongoDB');

    // Clear existing problems
    await ProblemBank.deleteMany({});
    console.log('Cleared existing problems');

    // Insert new problems
    const result = await ProblemBank.insertMany(problems);
    console.log(`Successfully seeded ${result.length} problems`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding problems:', error);
    process.exit(1);
  }
}

seedProblemBank(); 