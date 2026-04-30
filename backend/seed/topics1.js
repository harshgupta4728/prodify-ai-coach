// Topics 1-3: Arrays, Strings, Linked Lists
module.exports = [
  // ============ ARRAYS ============
  {
    name: 'Arrays',
    slug: 'arrays',
    icon: '📊',
    color: 'blue',
    difficulty: 'beginner',
    estimatedHours: 12,
    description: 'Arrays are the most fundamental data structure. Master traversal, manipulation, sorting, searching, and two-pointer techniques on contiguous memory blocks.',
    order: 1,
    subtopics: [
      {
        title: 'Array Basics & Operations',
        concepts: ['Declaration and initialization', 'Accessing elements by index (O(1))', 'Insertion and deletion (O(n))', 'Array traversal patterns', 'Static vs dynamic arrays'],
        codeExample: {
          title: 'Basic Array Operations',
          language: 'javascript',
          code: '// Traversal, insertion, deletion\nconst arr = [10, 20, 30, 40, 50];\n\n// Traverse\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}\n\n// Insert at index 2\narr.splice(2, 0, 25); // [10, 20, 25, 30, 40, 50]\n\n// Delete at index 3\narr.splice(3, 1); // [10, 20, 25, 40, 50]\n\n// Find max element\nconst max = Math.max(...arr); // 50',
          explanation: 'Arrays provide O(1) random access but O(n) insertion/deletion in the middle since elements must be shifted.'
        },
        timeComplexity: 'Access: O(1), Search: O(n), Insert/Delete: O(n)',
        spaceComplexity: 'O(n)',
        order: 0
      },
      {
        title: 'Two Pointer Technique',
        concepts: ['Left-right pointer approach', 'Fast-slow pointer approach', 'Pair finding problems', 'Partitioning arrays', 'Dutch National Flag algorithm'],
        codeExample: {
          title: 'Two Sum (Sorted Array)',
          language: 'javascript',
          code: 'function twoSumSorted(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}\n\n// Example: twoSumSorted([1,2,3,4,6], 6) → [1, 3]',
          explanation: 'Two pointers converge from both ends. If sum is too small, move left pointer right. If too large, move right pointer left. Works in O(n) on sorted arrays.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 1
      },
      {
        title: 'Sliding Window',
        concepts: ['Fixed-size window problems', 'Variable-size window problems', 'Maximum/minimum subarray', 'Window expansion and contraction', 'Kadane\'s algorithm'],
        codeExample: {
          title: 'Maximum Sum Subarray of Size K',
          language: 'javascript',
          code: 'function maxSumSubarray(arr, k) {\n  let windowSum = 0, maxSum = -Infinity;\n  for (let i = 0; i < arr.length; i++) {\n    windowSum += arr[i];\n    if (i >= k - 1) {\n      maxSum = Math.max(maxSum, windowSum);\n      windowSum -= arr[i - k + 1];\n    }\n  }\n  return maxSum;\n}\n\n// Kadane\'s Algorithm - Max Subarray Sum\nfunction kadane(arr) {\n  let maxSoFar = arr[0], maxEndingHere = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);\n    maxSoFar = Math.max(maxSoFar, maxEndingHere);\n  }\n  return maxSoFar;\n}',
          explanation: 'Sliding window avoids recomputation by maintaining a running sum. Kadane\'s algorithm finds the maximum subarray sum in O(n) by deciding at each step whether to extend or restart.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 2
      },
      {
        title: 'Sorting & Searching in Arrays',
        concepts: ['Binary search on sorted arrays', 'Merge sort and quicksort', 'Counting sort for bounded ranges', 'Finding kth largest/smallest', 'Search in rotated sorted array'],
        codeExample: {
          title: 'Binary Search',
          language: 'javascript',
          code: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\n// Search in Rotated Sorted Array\nfunction searchRotated(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[left] <= arr[mid]) {\n      if (target >= arr[left] && target < arr[mid]) right = mid - 1;\n      else left = mid + 1;\n    } else {\n      if (target > arr[mid] && target <= arr[right]) left = mid + 1;\n      else right = mid - 1;\n    }\n  }\n  return -1;\n}',
          explanation: 'Binary search halves the search space each step (O(log n)). For rotated arrays, determine which half is sorted and decide accordingly.'
        },
        timeComplexity: 'O(log n) for binary search',
        spaceComplexity: 'O(1)',
        order: 3
      },
      {
        title: 'Matrix / 2D Array Problems',
        concepts: ['Matrix traversal (row-wise, column-wise)', 'Spiral order traversal', 'Matrix rotation (90 degrees)', 'Search in sorted matrix', 'Island counting (DFS/BFS on grid)'],
        codeExample: {
          title: 'Rotate Matrix 90° Clockwise',
          language: 'javascript',
          code: 'function rotate(matrix) {\n  const n = matrix.length;\n  // Step 1: Transpose\n  for (let i = 0; i < n; i++) {\n    for (let j = i; j < n; j++) {\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n    }\n  }\n  // Step 2: Reverse each row\n  for (let i = 0; i < n; i++) {\n    matrix[i].reverse();\n  }\n  return matrix;\n}\n\n// [[1,2,3],[4,5,6],[7,8,9]] → [[7,4,1],[8,5,2],[9,6,3]]',
          explanation: 'Rotating a matrix 90° clockwise = transpose + reverse each row. This is an in-place O(n²) solution.'
        },
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1) in-place',
        order: 4
      }
    ],
    mcqs: [
      { question: 'What is the time complexity of accessing an element by index in an array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctIndex: 0, explanation: 'Arrays provide constant-time random access because elements are stored in contiguous memory locations.', difficulty: 'easy' },
      { question: 'What does Kadane\'s algorithm find?', options: ['Longest increasing subsequence', 'Maximum subarray sum', 'Minimum element', 'Median of array'], correctIndex: 1, explanation: 'Kadane\'s algorithm finds the maximum sum contiguous subarray in O(n) time.', difficulty: 'medium' },
      { question: 'In a sorted array, which search algorithm is most efficient?', options: ['Linear search', 'Binary search', 'Jump search', 'Interpolation search'], correctIndex: 1, explanation: 'Binary search is O(log n) and is the standard efficient search for sorted arrays.', difficulty: 'easy' },
      { question: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correctIndex: 2, explanation: 'QuickSort degrades to O(n²) when the pivot is consistently the smallest or largest element (e.g., already sorted array with first element as pivot).', difficulty: 'medium' },
      { question: 'How do you rotate a matrix 90° clockwise in-place?', options: ['Transpose then reverse rows', 'Reverse rows then transpose', 'Reverse columns then transpose', 'Transpose then reverse columns'], correctIndex: 0, explanation: 'Transpose the matrix, then reverse each row to get a 90° clockwise rotation.', difficulty: 'medium' },
      { question: 'What is the Dutch National Flag algorithm used for?', options: ['Sorting an array of 0s, 1s, and 2s', 'Finding duplicates', 'Binary search', 'Matrix multiplication'], correctIndex: 0, explanation: 'The Dutch National Flag algorithm partitions an array of 0s, 1s, and 2s in a single pass using three pointers.', difficulty: 'medium' },
      { question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, explanation: 'Merge sort requires O(n) additional space for the temporary arrays used during merging.', difficulty: 'medium' },
      { question: 'Which technique is best for finding a pair with a given sum in a sorted array?', options: ['Brute force O(n²)', 'Two pointer technique O(n)', 'Hashing O(n) extra space', 'Binary search for each element'], correctIndex: 1, explanation: 'Two pointer technique on a sorted array finds pairs in O(n) with O(1) space.', difficulty: 'easy' },
      { question: 'What does the sliding window technique optimize?', options: ['Space complexity', 'Avoiding recomputation in subarray problems', 'Sorting speed', 'Memory allocation'], correctIndex: 1, explanation: 'Sliding window avoids redundant computation by maintaining a window that slides across the array, updating the result incrementally.', difficulty: 'medium' },
      { question: 'In a rotated sorted array [4,5,6,7,0,1,2], what is the time complexity to find an element?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], correctIndex: 2, explanation: 'Modified binary search can find an element in a rotated sorted array in O(log n) by determining which half is sorted.', difficulty: 'hard' }
    ],
    interviewQuestions: [
      { question: 'Find the maximum subarray sum (Kadane\'s Algorithm)', answer: 'Use Kadane\'s algorithm: maintain maxEndingHere and maxSoFar. At each element, decide whether to extend the current subarray or start fresh. maxEndingHere = max(arr[i], maxEndingHere + arr[i]). Update maxSoFar = max(maxSoFar, maxEndingHere). Time: O(n), Space: O(1).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Google'] },
      { question: 'Merge two sorted arrays without extra space', answer: 'Use the Gap method (Shell sort approach): Start with gap = ceil((n+m)/2), compare elements gap apart and swap if needed. Reduce gap by half each iteration until gap = 0. Time: O((n+m) * log(n+m)), Space: O(1).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Goldman Sachs'] },
      { question: 'Find the next permutation of an array', answer: '1) Find the largest index i such that arr[i] < arr[i+1]. 2) Find the largest index j such that arr[i] < arr[j]. 3) Swap arr[i] and arr[j]. 4) Reverse the subarray from i+1 to end. If no such i exists, reverse the entire array. Time: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon'] },
      { question: 'Trapping Rain Water', answer: 'For each bar, water trapped = min(maxLeft, maxRight) - height. Use two arrays to precompute maxLeft and maxRight for each position, or use two pointers approach for O(1) space. Two pointers: maintain leftMax and rightMax, process the side with smaller max. Time: O(n), Space: O(1) with two pointers.', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft', 'Goldman Sachs'] },
      { question: 'Find all subarrays with a given sum (handles negatives)', answer: 'Use prefix sum + hashmap. Maintain a running prefix sum. If prefixSum - target exists in the map, we found a subarray. Store prefix sums in a hashmap with their count. This handles negative numbers unlike sliding window. Time: O(n), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook'] },
      { question: 'Sort an array of 0s, 1s, and 2s (Dutch National Flag)', answer: 'Use three pointers: low, mid, high. If arr[mid]==0, swap with low, increment both. If arr[mid]==1, just increment mid. If arr[mid]==2, swap with high, decrement high. Continue until mid > high. Single pass O(n), O(1) space.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Samsung'] },
      { question: 'Find the longest consecutive sequence in an unsorted array', answer: 'Use a HashSet. For each number, check if num-1 exists (skip if yes, as it\'s not the start of a sequence). If num-1 doesn\'t exist, count consecutive numbers from num. Track max length. Time: O(n), Space: O(n).', difficulty: 'medium', frequency: 'medium', companies: ['Google', 'Amazon'] }
    ]
  },

  // ============ STRINGS ============
  {
    name: 'Strings',
    slug: 'strings',
    icon: '🔤',
    color: 'green',
    difficulty: 'beginner',
    estimatedHours: 10,
    description: 'String manipulation is fundamental to programming. Learn pattern matching, palindromes, anagram detection, and classic string algorithms like KMP and Rabin-Karp.',
    order: 2,
    subtopics: [
      {
        title: 'String Basics & Manipulation',
        concepts: ['String immutability in many languages', 'Character encoding (ASCII, Unicode)', 'Common operations: reverse, substring, concat', 'String comparison and equality', 'StringBuilder for efficient concatenation'],
        codeExample: {
          title: 'Reverse a String',
          language: 'javascript',
          code: '// Method 1: Built-in\nconst rev1 = str => str.split("").reverse().join("");\n\n// Method 2: Two Pointers (in-place on char array)\nfunction reverseString(s) {\n  let left = 0, right = s.length - 1;\n  const chars = s.split("");\n  while (left < right) {\n    [chars[left], chars[right]] = [chars[right], chars[left]];\n    left++; right--;\n  }\n  return chars.join("");\n}',
          explanation: 'Two-pointer approach reverses in O(n) time and O(1) extra space (if modifying in place).'
        },
        timeComplexity: 'O(n) for most operations',
        spaceComplexity: 'O(n) for new string creation',
        order: 0
      },
      {
        title: 'Palindrome Problems',
        concepts: ['Check if string is palindrome', 'Longest palindromic substring', 'Palindrome partitioning', 'Expand around center technique', 'Manacher\'s algorithm (advanced)'],
        codeExample: {
          title: 'Longest Palindromic Substring',
          language: 'javascript',
          code: 'function longestPalindrome(s) {\n  let start = 0, maxLen = 1;\n\n  function expand(left, right) {\n    while (left >= 0 && right < s.length && s[left] === s[right]) {\n      if (right - left + 1 > maxLen) {\n        start = left;\n        maxLen = right - left + 1;\n      }\n      left--; right++;\n    }\n  }\n\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);     // Odd length\n    expand(i, i + 1); // Even length\n  }\n\n  return s.substring(start, start + maxLen);\n}',
          explanation: 'Expand around each character (and between characters) to find palindromes. O(n²) time, O(1) space.'
        },
        timeComplexity: 'O(n²) expand around center',
        spaceComplexity: 'O(1)',
        order: 1
      },
      {
        title: 'Anagram & Frequency Problems',
        concepts: ['Character frequency counting', 'Anagram detection and grouping', 'Sliding window for anagram search', 'Isomorphic strings', 'Valid parentheses'],
        codeExample: {
          title: 'Group Anagrams',
          language: 'javascript',
          code: 'function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return Array.from(map.values());\n}\n\n// groupAnagrams(["eat","tea","tan","ate","nat","bat"])\n// → [["eat","tea","ate"],["tan","nat"],["bat"]]',
          explanation: 'Sort each string to create a canonical key. Group strings with the same key. Time: O(n * k log k) where k is max string length.'
        },
        timeComplexity: 'O(n * k log k)',
        spaceComplexity: 'O(n * k)',
        order: 2
      },
      {
        title: 'Pattern Matching Algorithms',
        concepts: ['Brute force pattern matching', 'KMP (Knuth-Morris-Pratt) algorithm', 'Rabin-Karp (rolling hash)', 'Z-algorithm', 'Regular expressions basics'],
        codeExample: {
          title: 'KMP Pattern Matching',
          language: 'javascript',
          code: 'function kmpSearch(text, pattern) {\n  const lps = buildLPS(pattern);\n  let i = 0, j = 0;\n  const results = [];\n\n  while (i < text.length) {\n    if (text[i] === pattern[j]) { i++; j++; }\n    if (j === pattern.length) {\n      results.push(i - j);\n      j = lps[j - 1];\n    } else if (i < text.length && text[i] !== pattern[j]) {\n      j > 0 ? j = lps[j - 1] : i++;\n    }\n  }\n  return results;\n}\n\nfunction buildLPS(pattern) {\n  const lps = [0];\n  let len = 0, i = 1;\n  while (i < pattern.length) {\n    if (pattern[i] === pattern[len]) {\n      lps[i++] = ++len;\n    } else {\n      len > 0 ? len = lps[len - 1] : lps[i++] = 0;\n    }\n  }\n  return lps;\n}',
          explanation: 'KMP preprocesses the pattern into a failure function (LPS array) to avoid redundant comparisons. Time: O(n + m), Space: O(m).'
        },
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(m)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'What is the time complexity of checking if a string is a palindrome?', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'We compare characters from both ends toward the center, which takes O(n/2) = O(n) time.', difficulty: 'easy' },
      { question: 'What data structure is best for checking anagrams?', options: ['Stack', 'Queue', 'Hash Map / Frequency Array', 'Binary Tree'], correctIndex: 2, explanation: 'A frequency array (or hash map) counts character occurrences. Two strings are anagrams if they have identical character frequencies.', difficulty: 'easy' },
      { question: 'What is the time complexity of the KMP pattern matching algorithm?', options: ['O(n * m)', 'O(n + m)', 'O(n log m)', 'O(n²)'], correctIndex: 1, explanation: 'KMP runs in O(n + m) where n is text length and m is pattern length, thanks to the LPS preprocessing.', difficulty: 'medium' },
      { question: 'Which technique finds the longest palindromic substring in O(n²)?', options: ['Dynamic programming', 'Expand around center', 'Both A and B', 'KMP algorithm'], correctIndex: 2, explanation: 'Both DP (2D table) and expand-around-center achieve O(n²). Expand around center uses O(1) space vs O(n²) for DP.', difficulty: 'medium' },
      { question: 'What is the Rabin-Karp algorithm based on?', options: ['Suffix tree', 'Rolling hash function', 'Divide and conquer', 'Backtracking'], correctIndex: 1, explanation: 'Rabin-Karp uses a rolling hash to compare pattern hash with text window hash, achieving average O(n+m) time.', difficulty: 'medium' },
      { question: 'How many substrings does a string of length n have?', options: ['n', 'n²', 'n(n+1)/2', '2^n'], correctIndex: 2, explanation: 'A string of length n has n(n+1)/2 substrings: n of length 1, n-1 of length 2, ..., 1 of length n.', difficulty: 'easy' },
      { question: 'What is the space complexity of the expand-around-center palindrome approach?', options: ['O(n²)', 'O(n)', 'O(1)', 'O(n log n)'], correctIndex: 2, explanation: 'Expand around center only uses a few variables (start, maxLen, pointers), so O(1) extra space.', difficulty: 'medium' },
      { question: 'To check if two strings are rotations of each other, you can:', options: ['Sort both and compare', 'Check if s2 is a substring of s1+s1', 'Compare character frequencies', 'Use KMP on both'], correctIndex: 1, explanation: 'If s2 is a rotation of s1, then s2 must be a substring of s1 concatenated with itself (s1+s1).', difficulty: 'medium' },
      { question: 'What is a "subsequence" vs a "substring"?', options: ['They are the same', 'Substring must be contiguous, subsequence need not be', 'Subsequence must be contiguous, substring need not be', 'Both must be contiguous'], correctIndex: 1, explanation: 'A substring is a contiguous portion of the string. A subsequence maintains order but characters need not be adjacent.', difficulty: 'easy' },
      { question: 'What algorithm finds the longest palindromic substring in O(n) time?', options: ['KMP', 'Rabin-Karp', 'Manacher\'s algorithm', 'Z-algorithm'], correctIndex: 2, explanation: 'Manacher\'s algorithm cleverly reuses previously computed palindrome information to achieve linear O(n) time.', difficulty: 'hard' }
    ],
    interviewQuestions: [
      { question: 'Implement a function to check if a string has all unique characters', answer: 'Method 1: Use a Set — add each char, if Set already has it, return false. O(n) time, O(n) space. Method 2: For lowercase letters only, use a 26-bit bitmask. For each char, check if bit is set. O(n) time, O(1) space. Method 3: Sort the string first, check adjacent chars. O(n log n) time, O(1) space.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft'] },
      { question: 'Find the longest substring without repeating characters', answer: 'Use sliding window with a Set/Map. Maintain left and right pointers. Expand right, if char already in window, shrink from left until duplicate is removed. Track max window size. Time: O(n), Space: O(min(n, alphabet_size)).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Implement string compression (e.g., "aabcccccaaa" → "a2b1c5a3")', answer: 'Iterate through string, count consecutive chars. Build result string with char + count. If compressed length >= original length, return original. Use StringBuilder/array for efficiency. Time: O(n), Space: O(n).', difficulty: 'easy', frequency: 'medium', companies: ['Amazon', 'Microsoft'] },
      { question: 'Find the minimum window substring containing all characters of another string', answer: 'Use sliding window with two frequency maps. Expand right to include chars, when all chars are covered, shrink from left to minimize window. Track minimum window. Time: O(n + m), Space: O(n + m) where n and m are string lengths.', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon', 'Uber'] },
      { question: 'Check if one string is a permutation (anagram) of another', answer: 'Method 1: Sort both strings and compare — O(n log n). Method 2: Use frequency array of size 26 (for lowercase). Increment for first string, decrement for second. If all counts are 0, they are anagrams. O(n) time, O(1) space.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Goldman Sachs'] },
      { question: 'Longest Common Subsequence of two strings', answer: 'Use 2D DP. dp[i][j] = LCS length of first i chars and first j chars. If chars match: dp[i][j] = dp[i-1][j-1] + 1. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Time: O(n*m), Space: O(n*m), optimizable to O(min(n,m)).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Implement atoi (string to integer conversion)', answer: 'Handle: 1) Leading whitespace, 2) Optional sign (+/-), 3) Convert digits until non-digit, 4) Handle overflow (clamp to INT_MIN/INT_MAX). Be careful with edge cases: empty string, only whitespace, overflow, leading zeros. Time: O(n).', difficulty: 'medium', frequency: 'medium', companies: ['Microsoft', 'Amazon', 'Facebook'] }
    ]
  },

  // ============ LINKED LISTS ============
  {
    name: 'Linked Lists',
    slug: 'linked-lists',
    icon: '🔗',
    color: 'purple',
    difficulty: 'beginner',
    estimatedHours: 10,
    description: 'Linked lists provide dynamic memory allocation and efficient insertions/deletions. Master singly, doubly, and circular lists along with classic pointer manipulation techniques.',
    order: 3,
    subtopics: [
      {
        title: 'Singly Linked List',
        concepts: ['Node structure (data + next pointer)', 'Insertion at head, tail, and middle', 'Deletion by value and by position', 'Traversal and search', 'Comparison with arrays'],
        codeExample: {
          title: 'Singly Linked List Implementation',
          language: 'javascript',
          code: 'class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\n// Insert at head: O(1)\nfunction insertHead(head, val) {\n  return new ListNode(val, head);\n}\n\n// Delete a node by value: O(n)\nfunction deleteNode(head, val) {\n  const dummy = new ListNode(0, head);\n  let curr = dummy;\n  while (curr.next) {\n    if (curr.next.val === val) {\n      curr.next = curr.next.next;\n      break;\n    }\n    curr = curr.next;\n  }\n  return dummy.next;\n}',
          explanation: 'The dummy node technique simplifies edge cases (deleting head). Insertion at head is O(1), deletion requires traversal O(n).'
        },
        timeComplexity: 'Insert head: O(1), Search/Delete: O(n)',
        spaceComplexity: 'O(n)',
        order: 0
      },
      {
        title: 'Fast & Slow Pointer (Floyd\'s)',
        concepts: ['Detecting cycle in linked list', 'Finding cycle start node', 'Finding middle of linked list', 'Finding nth node from end', 'Happy number problem'],
        codeExample: {
          title: 'Detect Cycle & Find Middle',
          language: 'javascript',
          code: '// Detect cycle - Floyd\'s algorithm\nfunction hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n\n// Find middle node\nfunction findMiddle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow; // slow is at middle\n}',
          explanation: 'Slow pointer moves 1 step, fast moves 2 steps. They meet inside the cycle (if one exists). For middle finding, when fast reaches end, slow is at middle.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        order: 1
      },
      {
        title: 'Reversal Techniques',
        concepts: ['Iterative reversal', 'Recursive reversal', 'Reverse in groups of K', 'Reverse between positions m and n', 'Palindrome linked list check'],
        codeExample: {
          title: 'Reverse a Linked List',
          language: 'javascript',
          code: '// Iterative reversal\nfunction reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}\n\n// Recursive reversal\nfunction reverseRecursive(head) {\n  if (!head || !head.next) return head;\n  const newHead = reverseRecursive(head.next);\n  head.next.next = head;\n  head.next = null;\n  return newHead;\n}',
          explanation: 'Iterative: maintain prev, curr, next pointers. Flip each link. O(n) time, O(1) space. Recursive: reverse rest of list, then fix the link. O(n) time, O(n) stack space.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'Iterative: O(1), Recursive: O(n)',
        order: 2
      },
      {
        title: 'Merge & Sort Operations',
        concepts: ['Merge two sorted lists', 'Merge sort on linked list', 'Intersection of two lists', 'Add two numbers represented as lists', 'Flatten a multilevel list'],
        codeExample: {
          title: 'Merge Two Sorted Lists',
          language: 'javascript',
          code: 'function mergeTwoLists(l1, l2) {\n  const dummy = new ListNode(0);\n  let curr = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) {\n      curr.next = l1;\n      l1 = l1.next;\n    } else {\n      curr.next = l2;\n      l2 = l2.next;\n    }\n    curr = curr.next;\n  }\n  curr.next = l1 || l2;\n  return dummy.next;\n}',
          explanation: 'Use a dummy node and compare heads of both lists. Attach the smaller node. When one list is exhausted, attach the remaining. O(n + m) time.'
        },
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(1)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'What is the time complexity of inserting a node at the head of a singly linked list?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctIndex: 1, explanation: 'Inserting at the head only requires creating a new node and updating the head pointer — O(1).', difficulty: 'easy' },
      { question: 'Floyd\'s cycle detection algorithm uses:', options: ['Two stacks', 'A hash set', 'Fast and slow pointers', 'Recursion'], correctIndex: 2, explanation: 'Floyd\'s algorithm uses two pointers moving at different speeds. If there\'s a cycle, they will eventually meet.', difficulty: 'easy' },
      { question: 'What is the space complexity of iteratively reversing a linked list?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctIndex: 1, explanation: 'Iterative reversal uses only three pointers (prev, curr, next), so O(1) extra space.', difficulty: 'easy' },
      { question: 'Which operation is more efficient in a linked list compared to an array?', options: ['Random access', 'Insertion at beginning', 'Binary search', 'Accessing middle element'], correctIndex: 1, explanation: 'Inserting at the beginning of a linked list is O(1), while in an array it\'s O(n) due to shifting.', difficulty: 'easy' },
      { question: 'How do you find the intersection point of two linked lists?', options: ['Sort both lists', 'Use two pointers that switch to the other list\'s head at end', 'Compare all pairs', 'Use a stack'], correctIndex: 1, explanation: 'When pointer A reaches end, redirect to head of B and vice versa. They\'ll meet at the intersection after at most 2 passes.', difficulty: 'medium' },
      { question: 'What is the time complexity of merge sort on a linked list?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'Merge sort on a linked list is O(n log n) time. Unlike arrays, it can be done with O(1) extra space since we can merge by pointer manipulation.', difficulty: 'medium' },
      { question: 'A doubly linked list node contains:', options: ['Only next pointer', 'Data and next pointer', 'Data, next and previous pointers', 'Data and a random pointer'], correctIndex: 2, explanation: 'A doubly linked list node has three fields: data, a pointer to the next node, and a pointer to the previous node.', difficulty: 'easy' },
      { question: 'To check if a linked list is a palindrome, which approach uses O(1) space?', options: ['Copy to array and check', 'Use a stack', 'Reverse second half and compare', 'Use recursion'], correctIndex: 2, explanation: 'Find middle with slow/fast pointers, reverse the second half, compare both halves. O(n) time, O(1) space.', difficulty: 'medium' },
      { question: 'What is a sentinel/dummy node used for?', options: ['Storing extra data', 'Simplifying edge cases in list operations', 'Improving time complexity', 'Cycle detection'], correctIndex: 1, explanation: 'A dummy/sentinel node before the real head simplifies edge cases like deleting the head or inserting at position 0.', difficulty: 'medium' },
      { question: 'Reverse a linked list in groups of K. What is the time complexity?', options: ['O(n * k)', 'O(n)', 'O(n log n)', 'O(k)'], correctIndex: 1, explanation: 'We traverse each node exactly once, reversing in groups. Total time is O(n) regardless of k.', difficulty: 'hard' }
    ],
    interviewQuestions: [
      { question: 'Reverse a linked list (iterative and recursive)', answer: 'Iterative: Use three pointers (prev=null, curr=head, next). For each node: save next, point curr.next to prev, advance prev and curr. Return prev. O(n) time, O(1) space. Recursive: Base case: if head is null or single node, return head. Recursively reverse rest, then head.next.next = head, head.next = null. Return new head. O(n) time, O(n) stack space.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'] },
      { question: 'Detect and find the start of a cycle in a linked list', answer: 'Phase 1: Use Floyd\'s algorithm (slow/fast pointers). If they meet, cycle exists. Phase 2: Reset one pointer to head. Move both one step at a time. They meet at the cycle\'s start. Mathematical proof: if distance from head to cycle start is \'a\' and meeting point is \'b\' steps into the cycle, then a = c - b where c is cycle length.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Google'] },
      { question: 'Merge K sorted linked lists', answer: 'Method 1: Min-Heap — Push first node of each list into a min-heap. Extract min, add to result, push its next node. O(n log k) time. Method 2: Divide and conquer — Merge lists in pairs recursively. O(n log k) time. Method 3: Merge one by one — O(nk) time (less efficient).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'] },
      { question: 'Copy a linked list with a random pointer', answer: 'Method 1 (O(1) space): Interleave copied nodes (A→A\'→B→B\'→...). Set random pointers: copy.random = original.random.next. Then separate the two lists. Method 2 (O(n) space): Use a HashMap mapping original→copy. Two passes: first create all copies, then set next and random pointers.', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Facebook'] },
      { question: 'Add two numbers represented by linked lists', answer: 'Traverse both lists simultaneously, add corresponding digits plus carry. Create new nodes with digit = sum % 10, carry = Math.floor(sum / 10). Handle different lengths and final carry. If numbers are stored in reverse order (LSD first), traverse directly. If stored normally, either reverse first or use a stack.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Find the Kth node from the end of a linked list', answer: 'Two-pointer approach: Move first pointer K steps ahead. Then move both pointers together until first reaches null. Second pointer is now at Kth from end. Single pass, O(n) time, O(1) space. Alternative: Find length, then traverse to (length - K)th node.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft'] },
      { question: 'Flatten a sorted multi-level linked list', answer: 'For a linked list where each node has a next and a child pointer (sorted): Use merge sort approach. Recursively flatten the child lists, then merge with the main list. For bottom pointer variant: merge all bottom lists using merge two sorted lists. Time: O(n) where n is total nodes.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Microsoft'] }
    ]
  }
];
