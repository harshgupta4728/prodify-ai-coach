// Topics 7-9: Dynamic Programming, Binary Search, Greedy
module.exports = [
  // ============ DYNAMIC PROGRAMMING ============
  {
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    icon: '🧩',
    color: 'violet',
    difficulty: 'advanced',
    estimatedHours: 20,
    description: 'Dynamic Programming optimizes recursive solutions by storing subproblem results. Master memoization, tabulation, and classic DP patterns like knapsack, LCS, and LIS.',
    order: 7,
    subtopics: [
      {
        title: 'DP Fundamentals',
        concepts: ['Overlapping subproblems', 'Optimal substructure', 'Memoization (top-down)', 'Tabulation (bottom-up)', 'State definition and transitions'],
        codeExample: {
          title: 'Fibonacci — Memoization vs Tabulation',
          language: 'javascript',
          code: '// Top-down (Memoization)\nfunction fibMemo(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);\n  return memo[n];\n}\n\n// Bottom-up (Tabulation)\nfunction fibTab(n) {\n  if (n <= 1) return n;\n  let prev2 = 0, prev1 = 1;\n  for (let i = 2; i <= n; i++) {\n    const curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}',
          explanation: 'Memoization caches recursive results (top-down). Tabulation builds from base cases (bottom-up). Space optimization: only keep last 2 values.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n) memo, O(1) optimized',
        order: 0
      },
      {
        title: '1D DP Problems',
        concepts: ['Climbing stairs', 'House robber', 'Coin change (min coins)', 'Longest increasing subsequence', 'Word break problem'],
        codeExample: {
          title: 'Longest Increasing Subsequence',
          language: 'javascript',
          code: '// O(n²) DP approach\nfunction lengthOfLIS(nums) {\n  const dp = new Array(nums.length).fill(1);\n  for (let i = 1; i < nums.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[j] < nums[i]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n  }\n  return Math.max(...dp);\n}\n\n// O(n log n) with patience sorting\nfunction lisOptimized(nums) {\n  const tails = [];\n  for (const num of nums) {\n    let lo = 0, hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      tails[mid] < num ? lo = mid + 1 : hi = mid;\n    }\n    tails[lo] = num;\n  }\n  return tails.length;\n}',
          explanation: 'DP approach: dp[i] = length of LIS ending at index i. O(n²). Optimized: maintain tails array, binary search for position. O(n log n).'
        },
        timeComplexity: 'O(n²) basic, O(n log n) optimized',
        spaceComplexity: 'O(n)',
        order: 1
      },
      {
        title: '2D DP (Grid & String)',
        concepts: ['Unique paths in grid', 'Edit distance', 'Longest common subsequence', 'Minimum path sum', 'Wildcard/Regex matching'],
        codeExample: {
          title: 'Edit Distance (Levenshtein)',
          language: 'javascript',
          code: 'function minDistance(word1, word2) {\n  const m = word1.length, n = word2.length;\n  const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));\n  \n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n  \n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (word1[i-1] === word2[j-1]) {\n        dp[i][j] = dp[i-1][j-1];\n      } else {\n        dp[i][j] = 1 + Math.min(\n          dp[i-1][j],   // delete\n          dp[i][j-1],   // insert\n          dp[i-1][j-1]  // replace\n        );\n      }\n    }\n  }\n  return dp[m][n];\n}',
          explanation: 'dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1]. Three operations: insert, delete, replace. O(m*n) time and space.'
        },
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
        order: 2
      },
      {
        title: 'Knapsack Problems',
        concepts: ['0/1 Knapsack', 'Unbounded Knapsack', 'Subset sum problem', 'Partition equal subset sum', 'Target sum'],
        codeExample: {
          title: '0/1 Knapsack',
          language: 'javascript',
          code: 'function knapsack(weights, values, capacity) {\n  const n = weights.length;\n  const dp = Array.from({length: n + 1}, () =>\n    Array(capacity + 1).fill(0)\n  );\n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= capacity; w++) {\n      dp[i][w] = dp[i-1][w]; // don\'t take\n      if (weights[i-1] <= w) {\n        dp[i][w] = Math.max(dp[i][w],\n          dp[i-1][w - weights[i-1]] + values[i-1] // take\n        );\n      }\n    }\n  }\n  return dp[n][capacity];\n}\n\n// Space optimized (1D)\nfunction knapsack1D(weights, values, capacity) {\n  const dp = new Array(capacity + 1).fill(0);\n  for (let i = 0; i < weights.length; i++) {\n    for (let w = capacity; w >= weights[i]; w--) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}',
          explanation: 'For each item, either take it or skip it. dp[i][w] = max value with first i items and capacity w. Space can be optimized to 1D by iterating w in reverse.'
        },
        timeComplexity: 'O(n * W)',
        spaceComplexity: 'O(n * W), O(W) optimized',
        order: 3
      },
      {
        title: 'DP on Trees & Advanced',
        concepts: ['DP on binary trees', 'House robber on trees', 'Longest path in tree', 'Matrix chain multiplication', 'Bitmask DP'],
        codeExample: {
          title: 'House Robber III (Tree DP)',
          language: 'javascript',
          code: 'function rob(root) {\n  function dfs(node) {\n    if (!node) return [0, 0]; // [rob, skip]\n    const left = dfs(node.left);\n    const right = dfs(node.right);\n    // Rob this node: can\'t rob children\n    const robThis = node.val + left[1] + right[1];\n    // Skip this node: take max of each child\n    const skipThis = Math.max(...left) + Math.max(...right);\n    return [robThis, skipThis];\n  }\n  return Math.max(...dfs(root));\n}',
          explanation: 'Each node returns [maxIfRobbed, maxIfSkipped]. If we rob current node, children must be skipped. If we skip, children can be robbed or skipped (take max).'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        order: 4
      }
    ],
    mcqs: [
      { question: 'What are the two key properties for Dynamic Programming to apply?', options: ['Greedy choice and sorting', 'Overlapping subproblems and optimal substructure', 'Divide and conquer', 'Graph traversal and memoization'], correctIndex: 1, explanation: 'DP requires overlapping subproblems (same subproblems solved repeatedly) and optimal substructure (optimal solution built from optimal subsolutions).', difficulty: 'easy' },
      { question: 'What is the difference between memoization and tabulation?', options: ['They are the same', 'Memoization is top-down recursive, tabulation is bottom-up iterative', 'Memoization is bottom-up, tabulation is top-down', 'Memoization uses more space'], correctIndex: 1, explanation: 'Memoization: recursive + cache (top-down). Tabulation: iterative, fill table from base cases (bottom-up).', difficulty: 'easy' },
      { question: 'The time complexity of the 0/1 Knapsack problem is:', options: ['O(n)', 'O(n * W)', 'O(2^n)', 'O(n log n)'], correctIndex: 1, explanation: 'The DP solution has n items × W capacity states, each computed in O(1), giving O(n * W). Note: this is pseudo-polynomial.', difficulty: 'medium' },
      { question: 'What is the time complexity of Longest Increasing Subsequence using DP?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], correctIndex: 2, explanation: 'The basic DP approach uses two nested loops: for each element, check all previous elements. O(n²). Can be optimized to O(n log n) with binary search.', difficulty: 'medium' },
      { question: 'In the Coin Change problem (minimum coins), what is dp[i]?', options: ['Number of ways to make amount i', 'Minimum coins to make amount i', 'Maximum coins needed', 'Whether amount i is possible'], correctIndex: 1, explanation: 'dp[i] = minimum number of coins needed to make amount i. For each coin, dp[i] = min(dp[i], dp[i - coin] + 1).', difficulty: 'medium' },
      { question: 'Edit Distance between "kitten" and "sitting" is:', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: 'kitten → sitten (replace k→s) → sittin (replace e→i) → sitting (insert g). 3 operations.', difficulty: 'medium' },
      { question: 'Space optimization of 2D DP to 1D is possible when:', options: ['Always possible', 'Current row only depends on previous row', 'There are no dependencies', 'The table is square'], correctIndex: 1, explanation: 'If dp[i][j] only depends on dp[i-1][...], we can use a single row and update in-place (with careful ordering).', difficulty: 'medium' },
      { question: 'Which DP problem can be solved in O(n log n)?', options: ['Edit distance', 'Longest Increasing Subsequence', '0/1 Knapsack', 'Matrix chain multiplication'], correctIndex: 1, explanation: 'LIS can be solved in O(n log n) using patience sorting (binary search on tails array).', difficulty: 'hard' },
      { question: 'The Partition Equal Subset Sum problem is a variation of:', options: ['Coin change', '0/1 Knapsack', 'LCS', 'LIS'], correctIndex: 1, explanation: 'It reduces to: can we select a subset with sum = totalSum/2? This is a subset sum problem, which is a special case of 0/1 knapsack.', difficulty: 'medium' },
      { question: 'Matrix Chain Multiplication has time complexity:', options: ['O(n)', 'O(n²)', 'O(n³)', 'O(2^n)'], correctIndex: 2, explanation: 'MCM has O(n³) time using DP. We try all possible split points for each chain length.', difficulty: 'hard' }
    ],
    interviewQuestions: [
      { question: 'Coin Change — Find minimum coins to make a given amount', answer: 'dp[i] = min coins to make amount i. Initialize dp[0] = 0, rest = Infinity. For each amount from 1 to target, try each coin: dp[i] = min(dp[i], dp[i - coin] + 1) if i - coin >= 0. Return dp[amount] if not Infinity, else -1. Time: O(amount * coins), Space: O(amount).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Longest Common Subsequence (LCS)', answer: 'dp[i][j] = LCS length of first i chars of s1 and first j chars of s2. If s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). To reconstruct: trace back from dp[m][n]. Time: O(m*n), Space: O(m*n) or O(min(m,n)).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'House Robber — Maximum sum of non-adjacent elements', answer: 'dp[i] = max money robbing first i houses. dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Either skip current house (take dp[i-1]) or rob it (dp[i-2] + current). Space optimize to two variables. Time: O(n), Space: O(1).', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Google'] },
      { question: 'Longest Palindromic Subsequence', answer: 'dp[i][j] = LPS length in s[i..j]. If s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2. Else: dp[i][j] = max(dp[i+1][j], dp[i][j-1]). Fill diagonally. Time: O(n²), Space: O(n²). Alternative: LCS of string and its reverse.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google'] },
      { question: 'Word Break — Can a string be segmented into dictionary words?', answer: 'dp[i] = true if s[0..i-1] can be segmented. For each i, check all j < i: if dp[j] is true and s[j..i] is in dictionary, set dp[i] = true. Use a Set for O(1) dictionary lookup. Time: O(n² * m) where m is max word length, Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Apple'] },
      { question: 'Edit Distance (minimum operations to convert one string to another)', answer: 'dp[i][j] = min edits for s1[0..i-1] → s2[0..j-1]. If chars match: dp[i][j] = dp[i-1][j-1]. Else: 1 + min(dp[i-1][j] delete, dp[i][j-1] insert, dp[i-1][j-1] replace). Base: dp[i][0] = i, dp[0][j] = j. Time: O(mn), Space: O(mn) or O(n).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Partition Equal Subset Sum', answer: 'Find if array can be partitioned into two subsets with equal sum. If totalSum is odd, impossible. Target = totalSum/2. Reduce to subset sum: dp[j] = can we make sum j? For each num, iterate j from target to num: dp[j] = dp[j] || dp[j - num]. Time: O(n * sum), Space: O(sum).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook'] }
    ]
  },

  // ============ BINARY SEARCH ============
  {
    name: 'Binary Search',
    slug: 'binary-search',
    icon: '🔍',
    color: 'cyan',
    difficulty: 'intermediate',
    estimatedHours: 8,
    description: 'Binary search halves the search space each step, achieving O(log n). Master it on sorted arrays, rotated arrays, and answer-space (binary search on answer) problems.',
    order: 8,
    subtopics: [
      {
        title: 'Standard Binary Search',
        concepts: ['Search in sorted array', 'Finding first/last occurrence', 'Lower bound and upper bound', 'Search insert position', 'Count of element in sorted array'],
        codeExample: {
          title: 'Binary Search Variants',
          language: 'javascript',
          code: '// Standard binary search\nfunction binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === target) return mid;\n    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;\n  }\n  return -1;\n}\n\n// First occurrence (lower bound)\nfunction lowerBound(arr, target) {\n  let lo = 0, hi = arr.length - 1, result = -1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] >= target) {\n      if (arr[mid] === target) result = mid;\n      hi = mid - 1;\n    } else lo = mid + 1;\n  }\n  return result;\n}\n\n// Last occurrence (upper bound)\nfunction upperBound(arr, target) {\n  let lo = 0, hi = arr.length - 1, result = -1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] <= target) {\n      if (arr[mid] === target) result = mid;\n      lo = mid + 1;\n    } else hi = mid - 1;\n  }\n  return result;\n}',
          explanation: 'Standard binary search: lo <= hi, return exact match. Lower/upper bound: continue searching even after finding target to find first/last occurrence.'
        },
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        order: 0
      },
      {
        title: 'Binary Search on Rotated Arrays',
        concepts: ['Find pivot in rotated array', 'Search in rotated sorted array', 'Find minimum in rotated array', 'Handle duplicates in rotated array'],
        codeExample: {
          title: 'Search in Rotated Sorted Array',
          language: 'javascript',
          code: 'function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    // Left half is sorted\n    if (nums[lo] <= nums[mid]) {\n      if (target >= nums[lo] && target < nums[mid])\n        hi = mid - 1;\n      else\n        lo = mid + 1;\n    }\n    // Right half is sorted\n    else {\n      if (target > nums[mid] && target <= nums[hi])\n        lo = mid + 1;\n      else\n        hi = mid - 1;\n    }\n  }\n  return -1;\n}\n\n// Find minimum in rotated array\nfunction findMin(nums) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    nums[mid] > nums[hi] ? lo = mid + 1 : hi = mid;\n  }\n  return nums[lo];\n}',
          explanation: 'Determine which half is sorted. If target is in sorted half\'s range, search there. Otherwise, search the other half.'
        },
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        order: 1
      },
      {
        title: 'Binary Search on Answer',
        concepts: ['Minimize/maximize an answer', 'Allocate minimum pages', 'Split array largest sum', 'Koko eating bananas', 'Aggressive cows / magnetic balls'],
        codeExample: {
          title: 'Koko Eating Bananas',
          language: 'javascript',
          code: '// Koko can eat bananas at speed k. Find minimum k to finish in h hours.\nfunction minEatingSpeed(piles, h) {\n  let lo = 1, hi = Math.max(...piles);\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);\n    hours <= h ? hi = mid : lo = mid + 1;\n  }\n  return lo;\n}\n\n// Pattern: Binary search on the answer when:\n// 1. Answer has a monotonic property (if k works, k+1 also works)\n// 2. You can verify a candidate answer in O(n)\n// 3. Answer range is bounded [min, max]',
          explanation: 'Binary search on the answer: the answer lies in a range. For each candidate, verify if it\'s feasible. Use the monotonic property to eliminate half the range.'
        },
        timeComplexity: 'O(n * log(maxValue))',
        spaceComplexity: 'O(1)',
        order: 2
      },
      {
        title: 'Advanced Binary Search',
        concepts: ['Search in 2D sorted matrix', 'Median of two sorted arrays', 'Find peak element', 'Binary search on floating point', 'Ternary search for unimodal functions'],
        codeExample: {
          title: 'Find Peak Element',
          language: 'javascript',
          code: '// A peak element is greater than its neighbors\nfunction findPeakElement(nums) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] > nums[mid + 1]) {\n      hi = mid; // peak is at mid or to the left\n    } else {\n      lo = mid + 1; // peak is to the right\n    }\n  }\n  return lo;\n}\n\n// Search in 2D Matrix (rows and cols sorted)\nfunction searchMatrix(matrix, target) {\n  let row = 0, col = matrix[0].length - 1;\n  while (row < matrix.length && col >= 0) {\n    if (matrix[row][col] === target) return true;\n    matrix[row][col] > target ? col-- : row++;\n  }\n  return false;\n}',
          explanation: 'Peak element: if mid > mid+1, peak is on left side (including mid). Else peak is on right. Staircase search in 2D: start from top-right corner.'
        },
        timeComplexity: 'O(log n) peak, O(m + n) matrix',
        spaceComplexity: 'O(1)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'Binary search requires the array to be:', options: ['Sorted', 'Unsorted', 'Have unique elements', 'Of even length'], correctIndex: 0, explanation: 'Binary search works by comparing the middle element with the target, which only works correctly on sorted data.', difficulty: 'easy' },
      { question: 'The time complexity of binary search is:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctIndex: 1, explanation: 'Binary search halves the search space each iteration, giving O(log n) comparisons.', difficulty: 'easy' },
      { question: 'What is "binary search on answer"?', options: ['Searching for the answer in a sorted array', 'Binary searching the answer space when feasibility is monotonic', 'A recursive binary search', 'Searching in a BST'], correctIndex: 1, explanation: 'When the answer lies in a range and has a monotonic feasibility property, we binary search the answer space itself.', difficulty: 'medium' },
      { question: 'In a rotated sorted array [4,5,6,7,0,1,2], the minimum element can be found in:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctIndex: 1, explanation: 'Modified binary search: compare mid with hi. If mid > hi, minimum is in right half. Else it\'s in left half (including mid). O(log n).', difficulty: 'medium' },
      { question: 'The lower bound of a target in a sorted array gives:', options: ['The last occurrence', 'The first occurrence or insertion point', 'The middle occurrence', 'Random occurrence'], correctIndex: 1, explanation: 'Lower bound finds the first position where element >= target. If target exists, it\'s the first occurrence.', difficulty: 'medium' },
      { question: 'What is the time complexity of finding the median of two sorted arrays?', options: ['O(n + m)', 'O(log(n + m))', 'O(log(min(n, m)))', 'O(n * m)'], correctIndex: 2, explanation: 'Binary search on the smaller array to find the partition. O(log(min(n, m))).', difficulty: 'hard' },
      { question: 'A peak element can be found using binary search because:', options: ['Array is sorted', 'Peak has a monotonic neighbor property', 'Array has unique elements', 'Array is rotated'], correctIndex: 1, explanation: 'If nums[mid] < nums[mid+1], a peak must exist on the right (ascending side). This monotonic property enables binary search.', difficulty: 'medium' },
      { question: 'How many times does binary search loop for an array of size 1,000,000?', options: ['About 20', 'About 100', 'About 1000', 'About 10000'], correctIndex: 0, explanation: 'log₂(1,000,000) ≈ 20. Binary search performs at most ~20 comparisons for a million elements.', difficulty: 'easy' },
      { question: 'When searching in a 2D matrix (each row and column sorted), the staircase search starts from:', options: ['Top-left corner', 'Center', 'Top-right or bottom-left corner', 'Any corner'], correctIndex: 2, explanation: 'Top-right corner: going left decreases, going down increases. Bottom-left: going right increases, going up decreases. Both allow elimination of a row or column each step.', difficulty: 'medium' },
      { question: 'Binary search can be applied to which of these problems?', options: ['Finding connected components', 'Minimum number of days to make bouquets', 'BFS shortest path', 'Topological sort'], correctIndex: 1, explanation: 'Problems with monotonic feasibility (if X days work, X+1 also works) can use binary search on answer.', difficulty: 'medium' }
    ],
    interviewQuestions: [
      { question: 'Find the first and last position of a target in a sorted array', answer: 'Run binary search twice: once modified to find the leftmost occurrence (when found, continue searching left: hi = mid - 1), once for rightmost (when found, continue right: lo = mid + 1). Time: O(log n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'Search in a rotated sorted array', answer: 'Modified binary search: determine which half is sorted (compare nums[lo] with nums[mid]). If target is in the sorted half\'s range, search there. Otherwise search the other half. Time: O(log n). With duplicates: worst case O(n) when lo == mid == hi.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'] },
      { question: 'Find the median of two sorted arrays', answer: 'Binary search on the smaller array. Partition both arrays such that left half has (m+n+1)/2 elements. Ensure max of left ≤ min of right. Median = average of max-left and min-right (if even total). Time: O(log(min(m,n))), Space: O(1).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft', 'Apple'] },
      { question: 'Allocate minimum pages (or split array largest sum)', answer: 'Binary search on answer: lo = max(pages), hi = sum(pages). For each mid, greedily check if we can allocate to k students (each ≤ mid pages). If possible, try smaller (hi = mid). Else try larger (lo = mid + 1). Time: O(n * log(sum)).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon'] },
      { question: 'Find peak element in an array', answer: 'Binary search: if nums[mid] > nums[mid+1], peak is at mid or to the left (hi = mid). Else peak is to the right (lo = mid + 1). Works because we\'re guaranteed a peak exists (array boundaries are -infinity). Time: O(log n).', difficulty: 'easy', frequency: 'medium', companies: ['Google', 'Facebook'] },
      { question: 'Aggressive Cows / Magnetic Balls — Maximize minimum distance', answer: 'Binary search on the answer (minimum distance). lo = 0, hi = max_position - min_position. For each candidate distance mid, greedily place cows: place first cow at first position, place next cow at first position ≥ last + mid. If we can place all cows, try larger distance. Time: O(n log(range)).', difficulty: 'hard', frequency: 'medium', companies: ['Google', 'Amazon'] },
      { question: 'Find the square root of a number (integer or floating point)', answer: 'Integer: Binary search from 0 to n. If mid*mid ≤ n, save mid as answer, search right. Else search left. Floating point: Use lo=0, hi=n (or hi=1 if n<1). Repeat until hi-lo < epsilon. mid = (lo+hi)/2, compare mid*mid with n. Time: O(log n) integer, O(log(n/epsilon)) float.', difficulty: 'easy', frequency: 'medium', companies: ['Amazon', 'Microsoft'] }
    ]
  },

  // ============ GREEDY ============
  {
    name: 'Greedy',
    slug: 'greedy',
    icon: '💰',
    color: 'yellow',
    difficulty: 'intermediate',
    estimatedHours: 10,
    description: 'Greedy algorithms make locally optimal choices hoping for a global optimum. Master activity selection, interval scheduling, Huffman coding, and greedy proof techniques.',
    order: 9,
    subtopics: [
      {
        title: 'Greedy Basics',
        concepts: ['Greedy choice property', 'Optimal substructure', 'When greedy works vs DP', 'Proof of correctness (exchange argument)', 'Greedy stays ahead proof'],
        codeExample: {
          title: 'Activity Selection Problem',
          language: 'javascript',
          code: '// Select max non-overlapping activities\nfunction activitySelection(activities) {\n  // Sort by end time\n  activities.sort((a, b) => a.end - b.end);\n  const selected = [activities[0]];\n  let lastEnd = activities[0].end;\n\n  for (let i = 1; i < activities.length; i++) {\n    if (activities[i].start >= lastEnd) {\n      selected.push(activities[i]);\n      lastEnd = activities[i].end;\n    }\n  }\n  return selected;\n}\n\n// Example:\n// [{start:1,end:3},{start:2,end:5},{start:4,end:7},{start:6,end:8}]\n// Selected: [{1,3}, {4,7}] — wait, actually [{1,3}, {4,7}, ... ]',
          explanation: 'Sort activities by end time. Greedily pick the next activity that starts after the last selected one ends. This maximizes the count of non-overlapping activities.'
        },
        timeComplexity: 'O(n log n) due to sorting',
        spaceComplexity: 'O(1)',
        order: 0
      },
      {
        title: 'Interval Problems',
        concepts: ['Merge overlapping intervals', 'Minimum platforms/rooms needed', 'Non-overlapping intervals (remove minimum)', 'Interval scheduling maximization', 'Meeting rooms problem'],
        codeExample: {
          title: 'Merge Overlapping Intervals',
          language: 'javascript',
          code: 'function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = result[result.length - 1];\n    if (intervals[i][0] <= last[1]) {\n      last[1] = Math.max(last[1], intervals[i][1]);\n    } else {\n      result.push(intervals[i]);\n    }\n  }\n  return result;\n}\n\n// Minimum meeting rooms needed\nfunction minRooms(intervals) {\n  const starts = intervals.map(i => i[0]).sort((a,b) => a-b);\n  const ends = intervals.map(i => i[1]).sort((a,b) => a-b);\n  let rooms = 0, maxRooms = 0, e = 0;\n  for (let s = 0; s < starts.length; s++) {\n    if (starts[s] < ends[e]) rooms++;\n    else e++;\n    maxRooms = Math.max(maxRooms, rooms);\n  }\n  return maxRooms;\n}',
          explanation: 'Merge intervals: sort by start, extend end of last interval if overlap. Meeting rooms: use two sorted arrays of start/end times and a two-pointer sweep.'
        },
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        order: 1
      },
      {
        title: 'Greedy on Arrays & Strings',
        concepts: ['Jump game (can reach end?)', 'Gas station circuit', 'Candy distribution', 'Minimum number of coins', 'Reorganize string'],
        codeExample: {
          title: 'Jump Game',
          language: 'javascript',
          code: '// Can you reach the last index?\nfunction canJump(nums) {\n  let maxReach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > maxReach) return false;\n    maxReach = Math.max(maxReach, i + nums[i]);\n  }\n  return true;\n}\n\n// Minimum jumps to reach end\nfunction jump(nums) {\n  let jumps = 0, currentEnd = 0, farthest = 0;\n  for (let i = 0; i < nums.length - 1; i++) {\n    farthest = Math.max(farthest, i + nums[i]);\n    if (i === currentEnd) {\n      jumps++;\n      currentEnd = farthest;\n    }\n  }\n  return jumps;\n}',
          explanation: 'Track the farthest reachable index. If current index exceeds maxReach, we\'re stuck. Min jumps: count the number of times we extend our range.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 2
      },
      {
        title: 'Huffman Coding & Advanced Greedy',
        concepts: ['Huffman encoding', 'Fractional knapsack', 'Job sequencing with deadlines', 'Minimum spanning tree (Prim/Kruskal)', 'Optimal merge pattern'],
        codeExample: {
          title: 'Fractional Knapsack',
          language: 'javascript',
          code: 'function fractionalKnapsack(items, capacity) {\n  // Sort by value/weight ratio (descending)\n  items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));\n  let totalValue = 0;\n\n  for (const item of items) {\n    if (capacity >= item.weight) {\n      totalValue += item.value;\n      capacity -= item.weight;\n    } else {\n      // Take fraction\n      totalValue += item.value * (capacity / item.weight);\n      break;\n    }\n  }\n  return totalValue;\n}\n\n// Unlike 0/1 knapsack, we can take fractions\n// Greedy by value/weight ratio gives optimal solution',
          explanation: 'Unlike 0/1 knapsack, we can take fractions of items. Greedy: sort by value-to-weight ratio, take as much as possible of each item.'
        },
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'When does the Greedy approach work?', options: ['Always', 'When the problem has greedy choice property and optimal substructure', 'Only for sorting problems', 'Never for optimization'], correctIndex: 1, explanation: 'Greedy works when making locally optimal choices leads to a globally optimal solution (greedy choice + optimal substructure).', difficulty: 'easy' },
      { question: 'In the Activity Selection problem, activities should be sorted by:', options: ['Start time', 'Duration', 'End time', 'Number of overlaps'], correctIndex: 2, explanation: 'Sorting by end time and greedily selecting non-overlapping activities gives the maximum number of activities.', difficulty: 'medium' },
      { question: 'Fractional Knapsack can be solved greedily but 0/1 Knapsack cannot because:', options: ['Fractional knapsack has fewer items', 'In fractional we can take parts of items, preserving the greedy choice property', '0/1 is always harder', 'Fractional doesn\'t need sorting'], correctIndex: 1, explanation: 'Taking fractions allows us to always get the best value/weight ratio. In 0/1, taking a full item might prevent a better combination.', difficulty: 'medium' },
      { question: 'The Jump Game problem can be solved greedily in:', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2^n)'], correctIndex: 1, explanation: 'Track the farthest reachable index as you scan left to right. Single pass O(n).', difficulty: 'easy' },
      { question: 'Huffman Coding produces what type of code?', options: ['Fixed-length code', 'Variable-length prefix-free code', 'Arithmetic code', 'Base64 encoding'], correctIndex: 1, explanation: 'Huffman coding assigns shorter codes to frequent characters and longer codes to rare ones, creating a prefix-free variable-length code.', difficulty: 'medium' },
      { question: 'Minimum platforms needed at a railway station is solved by:', options: ['Dynamic programming', 'Sorting arrivals and departures separately and using two pointers', 'Graph traversal', 'Binary search'], correctIndex: 1, explanation: 'Sort arrivals and departures. Use two pointers to count simultaneous trains. Maximum simultaneous count = platforms needed.', difficulty: 'medium' },
      { question: 'Which problem CANNOT be solved by greedy?', options: ['Activity selection', 'Fractional knapsack', '0/1 Knapsack', 'Huffman coding'], correctIndex: 2, explanation: '0/1 Knapsack requires DP because greedy (by ratio) doesn\'t account for the constraint of taking items whole.', difficulty: 'medium' },
      { question: 'In the candy distribution problem (each child gets at least 1, higher rating gets more than neighbor), minimum candies needed uses:', options: ['Single left-to-right pass', 'Two passes: left-to-right then right-to-left', 'Sorting children by rating', 'Dynamic programming'], correctIndex: 1, explanation: 'Pass left to right: if rating[i] > rating[i-1], candy[i] = candy[i-1]+1. Pass right to left: similar. Take max of both passes.', difficulty: 'hard' },
      { question: 'Job Sequencing with deadlines maximizes:', options: ['Number of jobs', 'Total profit', 'Earliest completion', 'Shortest job time'], correctIndex: 1, explanation: 'Sort jobs by profit (descending). For each job, assign it to the latest available slot before its deadline. Maximizes total profit.', difficulty: 'medium' },
      { question: 'Kruskal\'s MST algorithm is an example of:', options: ['Dynamic programming', 'Divide and conquer', 'Greedy algorithm', 'Backtracking'], correctIndex: 2, explanation: 'Kruskal\'s greedily adds the cheapest edge that doesn\'t form a cycle. This greedy choice produces the minimum spanning tree.', difficulty: 'easy' }
    ],
    interviewQuestions: [
      { question: 'Merge overlapping intervals', answer: 'Sort intervals by start time. Initialize result with first interval. For each subsequent interval: if it overlaps with last in result (start <= last.end), merge by extending end = max(end, interval.end). Else push as new interval. Time: O(n log n), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon', 'Microsoft'] },
      { question: 'Jump Game II — Minimum jumps to reach end', answer: 'Greedy BFS approach: maintain currentEnd and farthest reachable. When index reaches currentEnd, increment jumps and extend to farthest. No need to actually explore all paths. Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google'] },
      { question: 'Gas Station — Can you complete a circuit?', answer: 'If total gas >= total cost, a solution exists. Find the starting station: iterate, tracking currentTank. If currentTank < 0, reset start to next station and reset tank. The remaining start position is the answer. Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google'] },
      { question: 'Non-overlapping Intervals — Remove minimum intervals', answer: 'Sort by end time. Greedily keep intervals that don\'t overlap with the last kept one. Count removed = total - kept. Equivalent to activity selection. Time: O(n log n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook'] },
      { question: 'Candy Distribution — Minimum candies to children', answer: 'Two-pass greedy. Initialize all = 1. Left pass: if rating[i] > rating[i-1], candy[i] = candy[i-1]+1. Right pass: if rating[i] > rating[i+1], candy[i] = max(candy[i], candy[i+1]+1). Sum all candies. Time: O(n), Space: O(n).', difficulty: 'hard', frequency: 'medium', companies: ['Amazon', 'Google'] },
      { question: 'Task Scheduler — Minimum intervals to execute all tasks', answer: 'Count frequency of each task. Max frequency = maxFreq, count of tasks with maxFreq = maxCount. Answer = max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount). The formula accounts for idle slots between the most frequent task. Time: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Facebook', 'Amazon', 'Google'] },
      { question: 'Job Sequencing with Deadlines — Maximize profit', answer: 'Sort jobs by profit (descending). For each job, find the latest available slot ≤ deadline. Use a boolean array of slots. If slot found, assign job and add profit. Time: O(n² ) naive, O(n log n) with DSU optimization.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Microsoft'] }
    ]
  }
];
