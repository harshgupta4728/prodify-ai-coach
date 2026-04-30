// Topics 10-12: Backtracking & Recursion, Two Pointers, Sliding Window
module.exports = [
  // ============ BACKTRACKING & RECURSION ============
  {
    name: 'Backtracking & Recursion',
    slug: 'backtracking',
    icon: '🔄',
    color: 'pink',
    difficulty: 'intermediate',
    estimatedHours: 12,
    description: 'Backtracking explores all possible solutions by building candidates incrementally and abandoning those that fail constraints. Essential for permutation, combination, and constraint satisfaction problems.',
    order: 10,
    subtopics: [
      {
        title: 'Recursion Fundamentals',
        concepts: ['Base case and recursive case', 'Call stack and stack frames', 'Tail recursion optimization', 'Recursion tree visualization', 'Recursion vs iteration tradeoffs'],
        codeExample: {
          title: 'Power Function & Tower of Hanoi',
          language: 'javascript',
          code: '// Fast power (exponentiation by squaring)\nfunction power(base, exp) {\n  if (exp === 0) return 1;\n  if (exp % 2 === 0) {\n    const half = power(base, exp / 2);\n    return half * half;\n  }\n  return base * power(base, exp - 1);\n}\n\n// Tower of Hanoi\nfunction hanoi(n, from, to, aux) {\n  if (n === 1) {\n    console.log(`Move disk 1 from ${from} to ${to}`);\n    return;\n  }\n  hanoi(n - 1, from, aux, to);\n  console.log(`Move disk ${n} from ${from} to ${to}`);\n  hanoi(n - 1, aux, to, from);\n}',
          explanation: 'Fast power: O(log n) by squaring. Tower of Hanoi: move n-1 disks to auxiliary, move largest to target, move n-1 from auxiliary to target. O(2^n) moves.'
        },
        timeComplexity: 'Power: O(log n), Hanoi: O(2^n)',
        spaceComplexity: 'O(log n) and O(n) respectively',
        order: 0
      },
      {
        title: 'Permutations & Combinations',
        concepts: ['Generate all permutations', 'Generate all combinations (C(n,k))', 'Subsets (power set)', 'Handling duplicates', 'Pruning to avoid duplicates'],
        codeExample: {
          title: 'Permutations & Subsets',
          language: 'javascript',
          code: '// All permutations\nfunction permute(nums) {\n  const result = [];\n  function backtrack(path, remaining) {\n    if (!remaining.length) { result.push([...path]); return; }\n    for (let i = 0; i < remaining.length; i++) {\n      path.push(remaining[i]);\n      backtrack(path, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);\n      path.pop();\n    }\n  }\n  backtrack([], nums);\n  return result;\n}\n\n// All subsets (power set)\nfunction subsets(nums) {\n  const result = [];\n  function backtrack(start, path) {\n    result.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return result;\n}',
          explanation: 'Permutations: try each unused element at each position. Subsets: at each element, choose to include or not. Backtrack by removing the last added element.'
        },
        timeComplexity: 'Permutations: O(n!), Subsets: O(2^n)',
        spaceComplexity: 'O(n) recursion depth',
        order: 1
      },
      {
        title: 'Grid & Board Problems',
        concepts: ['N-Queens problem', 'Sudoku solver', 'Word search in grid', 'Rat in a maze', 'Knight\'s tour'],
        codeExample: {
          title: 'N-Queens Problem',
          language: 'javascript',
          code: 'function solveNQueens(n) {\n  const result = [];\n  const board = Array.from({length: n}, () => Array(n).fill("."));\n  const cols = new Set(), diag1 = new Set(), diag2 = new Set();\n\n  function backtrack(row) {\n    if (row === n) {\n      result.push(board.map(r => r.join("")));\n      return;\n    }\n    for (let col = 0; col < n; col++) {\n      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col))\n        continue;\n      board[row][col] = "Q";\n      cols.add(col); diag1.add(row - col); diag2.add(row + col);\n      backtrack(row + 1);\n      board[row][col] = ".";\n      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);\n    }\n  }\n  backtrack(0);\n  return result;\n}',
          explanation: 'Place queens row by row. For each row, try each column. Check column, diagonal (row-col), and anti-diagonal (row+col) conflicts. Backtrack on conflict.'
        },
        timeComplexity: 'O(n!)',
        spaceComplexity: 'O(n²)',
        order: 2
      },
      {
        title: 'String & Partition Problems',
        concepts: ['Palindrome partitioning', 'Generate parentheses', 'Letter combinations of phone number', 'Word break (all solutions)', 'Expression add operators'],
        codeExample: {
          title: 'Generate Valid Parentheses',
          language: 'javascript',
          code: 'function generateParenthesis(n) {\n  const result = [];\n  function backtrack(s, open, close) {\n    if (s.length === 2 * n) {\n      result.push(s);\n      return;\n    }\n    if (open < n) backtrack(s + "(", open + 1, close);\n    if (close < open) backtrack(s + ")", open, close + 1);\n  }\n  backtrack("", 0, 0);\n  return result;\n}\n// n=3 → ["((()))","(()())","(())()","()(())","()()()"]',
          explanation: 'At each step, we can add "(" if open < n, or ")" if close < open. This ensures validity. Total valid combinations = Catalan number.'
        },
        timeComplexity: 'O(4^n / √n) — Catalan number',
        spaceComplexity: 'O(n)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'What is the key idea behind backtracking?', options: ['Always finding the optimal solution first', 'Building candidates incrementally and abandoning invalid ones', 'Sorting the input first', 'Using dynamic programming tables'], correctIndex: 1, explanation: 'Backtracking explores the solution space by incrementally building candidates and pruning branches that can\'t lead to valid solutions.', difficulty: 'easy' },
      { question: 'How many permutations does a set of n distinct elements have?', options: ['n', '2^n', 'n!', 'n²'], correctIndex: 2, explanation: 'n choices for first position, n-1 for second, etc. Total = n! permutations.', difficulty: 'easy' },
      { question: 'How many subsets does a set of n elements have?', options: ['n', 'n!', '2^n', 'n²'], correctIndex: 2, explanation: 'Each element is either included or excluded. 2 choices per element = 2^n total subsets.', difficulty: 'easy' },
      { question: 'The N-Queens problem can be solved in:', options: ['O(n)', 'O(n²)', 'O(n!)', 'O(2^n)'], correctIndex: 2, explanation: 'N-Queens explores at most n choices per row for n rows. With pruning, it\'s much faster in practice but worst case is O(n!).', difficulty: 'medium' },
      { question: 'What technique is used to avoid duplicate subsets when input has duplicates?', options: ['Use a hash set for results', 'Sort input and skip consecutive duplicates at same recursion level', 'Remove duplicates from input first', 'Use dynamic programming instead'], correctIndex: 1, explanation: 'Sort the array. At each level, if nums[i] == nums[i-1] and i > start, skip (it would generate a duplicate branch).', difficulty: 'medium' },
      { question: 'The number of valid parentheses combinations for n pairs is:', options: ['2^n', 'n!', 'n-th Catalan number', 'n²'], correctIndex: 2, explanation: 'Valid parentheses combinations follow the Catalan number sequence: C(n) = (2n)! / ((n+1)! * n!).', difficulty: 'medium' },
      { question: 'In the Sudoku solver, what is the backtracking strategy?', options: ['Try random numbers', 'Try each number 1-9 in empty cells, backtrack on conflict', 'Solve row by row', 'Use mathematical formulas'], correctIndex: 1, explanation: 'For each empty cell, try digits 1-9. Check row, column, and 3x3 box constraints. If no digit works, backtrack to previous cell.', difficulty: 'medium' },
      { question: 'Pruning in backtracking refers to:', options: ['Removing elements from the input', 'Skipping branches that can\'t lead to a solution', 'Sorting the candidates', 'Caching results'], correctIndex: 1, explanation: 'Pruning cuts off exploration of branches early when we can determine they won\'t lead to a valid or optimal solution.', difficulty: 'easy' },
      { question: 'What is the time complexity of generating all subsets of n elements?', options: ['O(n)', 'O(n log n)', 'O(n * 2^n)', 'O(2^n)'], correctIndex: 2, explanation: 'There are 2^n subsets, and copying each subset takes O(n) time, giving O(n * 2^n) total.', difficulty: 'medium' },
      { question: 'Combination Sum (can reuse elements) differs from Subsets in that:', options: ['Elements can be used multiple times', 'We need to reach a target sum', 'Both A and B', 'Neither'], correctIndex: 2, explanation: 'Combination Sum allows reuse (start from same index, not i+1) and has a target sum constraint that enables pruning.', difficulty: 'medium' }
    ],
    interviewQuestions: [
      { question: 'N-Queens — Place N queens on NxN board with no conflicts', answer: 'Place queens row by row. For each row, try each column. Use sets to track occupied columns, diagonals (row-col), and anti-diagonals (row+col). If no conflict, place queen and recurse to next row. Backtrack by removing queen. Time: O(n!), Space: O(n).', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Generate all permutations of a list', answer: 'Backtracking: maintain current path and remaining elements. At each step, pick each remaining element, add to path, recurse with reduced remaining. Backtrack by removing element. For duplicates: sort first, skip if same as previous at same level. Time: O(n * n!), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook', 'Microsoft'] },
      { question: 'Sudoku Solver', answer: 'Find next empty cell. Try digits 1-9, validate against row, column, and 3x3 box. If valid, place and recurse. If recursion succeeds, done. If fails, backtrack (remove digit). Use bitsets or sets for O(1) validation. Time: O(9^(empty cells)), but pruning makes it practical.', difficulty: 'hard', frequency: 'medium', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Word Search — Find if word exists in grid', answer: 'DFS from each cell matching first character. Mark visited cells (set to special char). Try all 4 directions. If complete word found, return true. Backtrack by restoring cell. Time: O(m * n * 4^L) where L is word length.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Facebook'] },
      { question: 'Combination Sum — Find all combinations summing to target', answer: 'Sort candidates. Backtrack with index and remaining target. For each candidate at index i: if candidate <= remaining, include it and recurse from i (reuse allowed) or i+1 (no reuse). Prune: if candidate > remaining, break. Time: varies with input.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google'] },
      { question: 'Palindrome Partitioning — All ways to partition string into palindromes', answer: 'Backtrack: at each position, try all substrings starting there. If substring is palindrome, include in current partition and recurse from the end of that substring. Base case: reached end of string, add current partition to result. Time: O(n * 2^n).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google'] },
      { question: 'Letter Combinations of a Phone Number', answer: 'Map digits to letters. Backtrack: for each digit, try each mapped letter, recurse to next digit. Base case: index reaches end, add combination to result. Time: O(4^n) where n is number of digits (some digits map to 4 letters).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Facebook', 'Google'] }
    ]
  },

  // ============ TWO POINTERS ============
  {
    name: 'Two Pointers',
    slug: 'two-pointers',
    icon: '👆',
    color: 'indigo',
    difficulty: 'beginner',
    estimatedHours: 6,
    description: 'Two pointer technique uses two indices to traverse data structures efficiently. Master the convergent, same-direction, and fast-slow pointer patterns for optimal solutions.',
    order: 11,
    subtopics: [
      {
        title: 'Opposite Direction (Convergent)',
        concepts: ['Two Sum on sorted array', 'Container with most water', 'Trapping rain water', 'Valid palindrome', '3Sum and 4Sum problems'],
        codeExample: {
          title: 'Container With Most Water',
          language: 'javascript',
          code: 'function maxArea(height) {\n  let left = 0, right = height.length - 1;\n  let maxWater = 0;\n  while (left < right) {\n    const water = Math.min(height[left], height[right]) * (right - left);\n    maxWater = Math.max(maxWater, water);\n    height[left] < height[right] ? left++ : right--;\n  }\n  return maxWater;\n}\n\n// 3Sum: find all triplets that sum to 0\nfunction threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const result = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let lo = i + 1, hi = nums.length - 1;\n    while (lo < hi) {\n      const sum = nums[i] + nums[lo] + nums[hi];\n      if (sum === 0) {\n        result.push([nums[i], nums[lo], nums[hi]]);\n        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;\n        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;\n        lo++; hi--;\n      } else if (sum < 0) lo++;\n      else hi--;\n    }\n  }\n  return result;\n}',
          explanation: 'Move the pointer at the shorter line inward (can\'t get more water keeping it). 3Sum: fix one element, use two pointers for the remaining pair.'
        },
        timeComplexity: 'O(n) for 2-pointer, O(n²) for 3Sum',
        spaceComplexity: 'O(1)',
        order: 0
      },
      {
        title: 'Same Direction (Sliding)',
        concepts: ['Remove duplicates from sorted array', 'Move zeroes to end', 'Partition problems', 'Merge sorted arrays in-place', 'Remove element'],
        codeExample: {
          title: 'Remove Duplicates & Move Zeroes',
          language: 'javascript',
          code: '// Remove duplicates from sorted array (in-place)\nfunction removeDuplicates(nums) {\n  let slow = 0;\n  for (let fast = 1; fast < nums.length; fast++) {\n    if (nums[fast] !== nums[slow]) {\n      slow++;\n      nums[slow] = nums[fast];\n    }\n  }\n  return slow + 1; // new length\n}\n\n// Move zeroes to end, maintaining order\nfunction moveZeroes(nums) {\n  let slow = 0;\n  for (let fast = 0; fast < nums.length; fast++) {\n    if (nums[fast] !== 0) {\n      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];\n      slow++;\n    }\n  }\n}',
          explanation: 'Slow pointer marks the write position. Fast pointer scans for valid elements. This partitioning pattern appears in many array problems.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 1
      },
      {
        title: 'Fast & Slow Pointers',
        concepts: ['Linked list cycle detection', 'Find middle of linked list', 'Happy number', 'Linked list palindrome check', 'Find duplicate number (Floyd\'s)'],
        codeExample: {
          title: 'Find Duplicate Number (Floyd\'s)',
          language: 'javascript',
          code: '// Array has n+1 integers in range [1,n], one duplicate\nfunction findDuplicate(nums) {\n  // Phase 1: Find intersection in cycle\n  let slow = nums[0], fast = nums[0];\n  do {\n    slow = nums[slow];\n    fast = nums[nums[fast]];\n  } while (slow !== fast);\n\n  // Phase 2: Find cycle entrance\n  slow = nums[0];\n  while (slow !== fast) {\n    slow = nums[slow];\n    fast = nums[fast];\n  }\n  return slow;\n}\n\n// Treat array as linked list: index → value\n// Duplicate value creates a cycle',
          explanation: 'Map array to linked list (index → nums[index]). Duplicate creates a cycle. Floyd\'s algorithm finds the cycle entrance = duplicate number. O(n) time, O(1) space.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 2
      }
    ],
    mcqs: [
      { question: 'Two pointer technique works best on:', options: ['Unsorted arrays', 'Sorted arrays or linked lists', 'Trees', 'Graphs'], correctIndex: 1, explanation: 'Two pointers exploit sorted order (or structural properties of linked lists) to make directional decisions.', difficulty: 'easy' },
      { question: 'In the "Container With Most Water" problem, why move the shorter pointer?', options: ['To increase height', 'Moving the taller pointer can only decrease area', 'Both A and B', 'Random choice works too'], correctIndex: 2, explanation: 'Moving the shorter line inward might find a taller line. Moving the taller line inward can only decrease or maintain the minimum height, reducing area.', difficulty: 'medium' },
      { question: 'The 3Sum problem has time complexity:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'], correctIndex: 2, explanation: 'Sort: O(n log n). Fix one element and use two pointers: O(n) inner loop, O(n) outer = O(n²). Total: O(n²).', difficulty: 'medium' },
      { question: 'Remove duplicates from sorted array uses which pointer pattern?', options: ['Opposite direction', 'Same direction (slow/fast)', 'Fast/slow cycle detection', 'Random pointers'], correctIndex: 1, explanation: 'Slow pointer tracks write position, fast pointer finds next unique element. Both move in the same direction.', difficulty: 'easy' },
      { question: 'Floyd\'s cycle detection is a type of:', options: ['Opposite pointer', 'Sliding window', 'Fast and slow pointer', 'Binary search'], correctIndex: 2, explanation: 'Floyd\'s algorithm uses a slow pointer (1 step) and fast pointer (2 steps) to detect cycles in O(n) time, O(1) space.', difficulty: 'easy' },
      { question: 'Two pointers for pair sum in sorted array is O(n) because:', options: ['We visit each element at most twice', 'Each element is visited exactly once', 'Each pointer moves at most n times', 'Sorting is already done'], correctIndex: 2, explanation: 'Each pointer moves only forward (left++) or backward (right--), at most n steps total, giving O(n).', difficulty: 'medium' },
      { question: 'The "Sort Colors" (Dutch National Flag) problem uses:', options: ['One pointer', 'Two pointers', 'Three pointers', 'Four pointers'], correctIndex: 2, explanation: 'Three pointers: low (0s boundary), mid (current), high (2s boundary). Process mid and swap as needed.', difficulty: 'medium' },
      { question: 'To check if a string is a valid palindrome (ignoring non-alphanumeric):', options: ['Compare with reverse', 'Use two pointers from both ends, skip non-alphanumeric', 'Use a stack', 'Use recursion'], correctIndex: 1, explanation: 'Two pointers from start and end, skip non-alphanumeric chars, compare characters case-insensitively. O(n) time, O(1) space.', difficulty: 'easy' },
      { question: 'Merge two sorted arrays in-place (nums1 has enough space) — pointers start from:', options: ['Beginning of both arrays', 'End of both arrays', 'Beginning of nums1, end of nums2', 'Middle of both'], correctIndex: 1, explanation: 'Start from the end of both arrays, placing the larger element at the end of nums1. This avoids overwriting elements. O(n + m).', difficulty: 'medium' },
      { question: 'How many unique quadruplets does 4Sum find?', options: ['O(n)', 'O(n²)', 'O(n³)', 'Varies'], correctIndex: 3, explanation: '4Sum = sort + fix two elements + two pointers. Time is O(n³). Number of unique quadruplets varies with input.', difficulty: 'medium' }
    ],
    interviewQuestions: [
      { question: '3Sum — Find all unique triplets that sum to zero', answer: 'Sort array. Fix one element (i), use two pointers (lo=i+1, hi=end) for remaining two. Skip duplicates at all three levels. If sum == 0, record and move both pointers. If sum < 0, move lo right. If sum > 0, move hi left. Time: O(n²), Space: O(1) extra.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Container With Most Water', answer: 'Two pointers at both ends. Calculate area = min(h[l], h[r]) * (r-l). Move the pointer with shorter height (moving taller can only reduce min height). Track max area. Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'Remove duplicates from sorted array in-place', answer: 'Slow pointer at 0, fast from 1. When fast finds a new value (different from slow), increment slow and copy. Return slow + 1 as new length. For allowing k duplicates: compare with nums[slow - k + 1]. Time: O(n), Space: O(1).', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Facebook'] },
      { question: 'Sort Colors (Dutch National Flag)', answer: 'Three pointers: low=0, mid=0, high=n-1. If arr[mid]==0: swap with low, increment both. If arr[mid]==1: increment mid. If arr[mid]==2: swap with high, decrement high only (mid stays to recheck swapped element). Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Google'] },
      { question: 'Trapping Rain Water', answer: 'Two pointers: left=0, right=n-1, leftMax=0, rightMax=0. If leftMax < rightMax: water at left = leftMax - height[left] (if positive). Move left. Else: process right similarly. Move right. This works because the limiting factor is the smaller max. Time: O(n), Space: O(1).', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Goldman Sachs'] },
      { question: 'Find the duplicate number in array [1,n] with n+1 elements', answer: 'Use Floyd\'s cycle detection. Treat array as linked list (index → value). Phase 1: slow=nums[slow], fast=nums[nums[fast]] until they meet. Phase 2: reset slow to start, move both one step until they meet again. Meeting point = duplicate. Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Boats to Save People (pair heavy with light)', answer: 'Sort people by weight. Two pointers: lightest (left) and heaviest (right). If they fit together (sum ≤ limit), pair them (move both pointers). Otherwise, heavy person goes alone (move right). Count boats. Time: O(n log n), Space: O(1).', difficulty: 'medium', frequency: 'medium', companies: ['Google', 'Amazon'] }
    ]
  },

  // ============ SLIDING WINDOW ============
  {
    name: 'Sliding Window',
    slug: 'sliding-window',
    icon: '🪟',
    color: 'teal',
    difficulty: 'intermediate',
    estimatedHours: 8,
    description: 'Sliding window technique maintains a window over a sequence, expanding and shrinking it to find optimal subarrays/substrings. Master fixed-size and variable-size window patterns.',
    order: 12,
    subtopics: [
      {
        title: 'Fixed Size Window',
        concepts: ['Maximum sum subarray of size K', 'First negative in every window of size K', 'Count distinct elements in every window', 'Maximum of all subarrays of size K', 'Average of subarrays of size K'],
        codeExample: {
          title: 'Max Sum Subarray & Sliding Window Maximum',
          language: 'javascript',
          code: '// Maximum sum subarray of size k\nfunction maxSumSubarray(arr, k) {\n  let windowSum = 0, maxSum = -Infinity;\n  for (let i = 0; i < arr.length; i++) {\n    windowSum += arr[i];\n    if (i >= k - 1) {\n      maxSum = Math.max(maxSum, windowSum);\n      windowSum -= arr[i - k + 1];\n    }\n  }\n  return maxSum;\n}\n\n// Sliding window max using deque\nfunction maxSlidingWindow(nums, k) {\n  const result = [], deque = []; // stores indices\n  for (let i = 0; i < nums.length; i++) {\n    // Remove indices outside window\n    while (deque.length && deque[0] <= i - k) deque.shift();\n    // Remove smaller elements from back\n    while (deque.length && nums[deque[deque.length-1]] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[0]]);\n  }\n  return result;\n}',
          explanation: 'Fixed window: add new element, remove old. Sliding max: deque maintains indices in decreasing value order. Front is always the max.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(k) for deque, O(1) for sum',
        order: 0
      },
      {
        title: 'Variable Size Window',
        concepts: ['Longest substring without repeating chars', 'Smallest subarray with sum >= S', 'Longest substring with at most K distinct chars', 'Minimum window substring', 'Fruit into baskets'],
        codeExample: {
          title: 'Longest Substring Without Repeating Characters',
          language: 'javascript',
          code: 'function lengthOfLongestSubstring(s) {\n  const map = new Map(); // char → last index\n  let maxLen = 0, left = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (map.has(s[right]) && map.get(s[right]) >= left) {\n      left = map.get(s[right]) + 1;\n    }\n    map.set(s[right], right);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}\n\n// Smallest subarray with sum >= target\nfunction minSubArrayLen(target, nums) {\n  let left = 0, sum = 0, minLen = Infinity;\n  for (let right = 0; right < nums.length; right++) {\n    sum += nums[right];\n    while (sum >= target) {\n      minLen = Math.min(minLen, right - left + 1);\n      sum -= nums[left++];\n    }\n  }\n  return minLen === Infinity ? 0 : minLen;\n}',
          explanation: 'Variable window: expand right, shrink left when constraint is violated/met. Track the best window size.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(min(n, charset))',
        order: 1
      },
      {
        title: 'String Window Problems',
        concepts: ['Find all anagrams in a string', 'Minimum window substring', 'Permutation in string', 'Longest repeating character replacement', 'Count number of nice subarrays'],
        codeExample: {
          title: 'Minimum Window Substring',
          language: 'javascript',
          code: 'function minWindow(s, t) {\n  const need = new Map();\n  for (const c of t) need.set(c, (need.get(c) || 0) + 1);\n  let left = 0, formed = 0, required = need.size;\n  let minLen = Infinity, minStart = 0;\n  const window = new Map();\n\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    window.set(c, (window.get(c) || 0) + 1);\n    if (need.has(c) && window.get(c) === need.get(c)) formed++;\n\n    while (formed === required) {\n      if (right - left + 1 < minLen) {\n        minLen = right - left + 1;\n        minStart = left;\n      }\n      const d = s[left];\n      window.set(d, window.get(d) - 1);\n      if (need.has(d) && window.get(d) < need.get(d)) formed--;\n      left++;\n    }\n  }\n  return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);\n}',
          explanation: 'Expand right to include all required chars. Once all satisfied, shrink left to minimize window. Track minimum valid window.'
        },
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(n + m)',
        order: 2
      }
    ],
    mcqs: [
      { question: 'Sliding window technique is most useful for:', options: ['Sorting problems', 'Subarray/substring problems with contiguous elements', 'Graph traversal', 'Tree problems'], correctIndex: 1, explanation: 'Sliding window efficiently handles problems involving contiguous subarrays or substrings.', difficulty: 'easy' },
      { question: 'A fixed-size sliding window problem has what constraint?', options: ['Window can grow/shrink', 'Window size is always K', 'Window starts from the middle', 'Window wraps around'], correctIndex: 1, explanation: 'Fixed-size window maintains exactly K elements, sliding one position at a time.', difficulty: 'easy' },
      { question: 'Time complexity of "Longest substring without repeating characters" is:', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n³)'], correctIndex: 1, explanation: 'Each character is processed at most twice (once by right pointer, once by left). Total: O(n).', difficulty: 'medium' },
      { question: 'In variable-size sliding window, the window shrinks when:', options: ['We reach the end', 'The constraint is satisfied (minimize) or violated (maximize)', 'The window size exceeds n', 'Every other step'], correctIndex: 1, explanation: 'For minimization: shrink when constraint is satisfied (to find smaller valid windows). For maximization: shrink when constraint is violated.', difficulty: 'medium' },
      { question: 'The "Minimum Window Substring" problem uses:', options: ['Fixed-size window', 'Two hash maps (need & have)', 'Sorting', 'Binary search'], correctIndex: 1, explanation: 'Use one map to track what we need (from target) and another for current window contents. Expand/shrink to find minimum valid window.', difficulty: 'medium' },
      { question: 'How do you find all anagrams of pattern p in string s?', options: ['Sort s and binary search', 'Fixed window of size p.length, compare char frequencies', 'DFS on all substrings', 'Dynamic programming'], correctIndex: 1, explanation: 'Slide a window of size len(p) across s. Maintain character frequency count. When frequencies match, record the position.', difficulty: 'medium' },
      { question: 'Sliding window maximum (of window size K) uses which auxiliary data structure?', options: ['Stack', 'Min-heap', 'Monotonic deque', 'Hash map'], correctIndex: 2, explanation: 'A monotonic decreasing deque maintains candidates for maximum. Front of deque is always the current window\'s max.', difficulty: 'medium' },
      { question: '"Longest Repeating Character Replacement" allows at most K replacements. The key insight is:', options: ['Sort the string first', 'Window is valid if windowSize - maxFreq <= k', 'Use dynamic programming', 'Always replace the least frequent'], correctIndex: 1, explanation: 'If the window size minus the frequency of the most common char is ≤ k, we can make the whole window one character with ≤ k replacements.', difficulty: 'hard' },
      { question: 'When should you use sliding window instead of brute force?', options: ['Always', 'When checking all subarrays/substrings and need O(n) instead of O(n²)', 'Only for sorted arrays', 'When recursion is needed'], correctIndex: 1, explanation: 'Sliding window reduces O(n² or n³) brute force to O(n) for subarray/substring problems with a monotonic or aggregate property.', difficulty: 'easy' },
      { question: 'Fruit Into Baskets is equivalent to:', options: ['Longest subarray with at most 2 distinct elements', 'Maximum sum subarray', 'Shortest subarray with sum >= K', 'Longest palindromic substring'], correctIndex: 0, explanation: '"Two baskets, each holds one type of fruit" = at most 2 distinct types = longest subarray with at most 2 distinct elements.', difficulty: 'medium' }
    ],
    interviewQuestions: [
      { question: 'Longest Substring Without Repeating Characters', answer: 'Sliding window with a Set or Map. Right pointer expands. If duplicate found, move left pointer past the previous occurrence. Track max window size. Using Map (char → index) allows O(1) jumps: left = max(left, map.get(char) + 1). Time: O(n), Space: O(min(n, charset)).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Minimum Window Substring', answer: 'Two maps: need (from t) and window (current counts). Expand right to include chars. When all needed chars are satisfied, shrink left to minimize. Track minimum valid window. Time: O(|s| + |t|), Space: O(|s| + |t|).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon', 'Uber'] },
      { question: 'Find All Anagrams in a String', answer: 'Fixed window of size len(p). Maintain frequency count for window. When window freq matches pattern freq, record start index. Optimize: use a "matches" counter tracking how many chars have correct frequency. Time: O(n), Space: O(1) since charset is bounded.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook'] },
      { question: 'Longest Repeating Character Replacement', answer: 'Variable window. Track frequency of each char in window and maxFreq. Window is valid if windowSize - maxFreq ≤ k. Expand right always. Shrink left only when invalid. Key insight: maxFreq never needs to decrease (we only care about longest window). Time: O(n), Space: O(26) = O(1).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Amazon'] },
      { question: 'Sliding Window Maximum', answer: 'Monotonic decreasing deque stores indices. For each element: remove front if outside window. Remove all back elements smaller than current (they\'ll never be max). Push current. Front of deque = window max. Time: O(n), Space: O(k).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Smallest Subarray with Sum >= Target', answer: 'Variable window. Expand right, add to sum. While sum >= target: update min length, subtract nums[left], shrink left. Return min length or 0 if never achieved. Time: O(n) — each element is added and removed at most once. Space: O(1).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Facebook'] },
      { question: 'Subarrays with K Different Integers', answer: 'Key trick: exactly K distinct = atMost(K) - atMost(K-1). Implement atMost: sliding window with a frequency map. Expand right, when distinct count > K, shrink left. Count of valid subarrays ending at right = right - left + 1. Time: O(n), Space: O(K).', difficulty: 'hard', frequency: 'medium', companies: ['Google', 'Amazon'] }
    ]
  }
];
