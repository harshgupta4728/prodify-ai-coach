// Topics 13-15: Heap/Priority Queue, Hashing, Sorting & Searching
module.exports = [
  // ============ HEAP / PRIORITY QUEUE ============
  {
    name: 'Heap / Priority Queue',
    slug: 'heap',
    icon: '⛰️',
    color: 'amber',
    difficulty: 'intermediate',
    estimatedHours: 10,
    description: 'Heaps provide efficient access to min/max elements. Master min-heaps, max-heaps, heapify, and classic problems like top-K, merge K sorted, and median finding.',
    order: 13,
    subtopics: [
      {
        title: 'Heap Fundamentals',
        concepts: ['Complete binary tree property', 'Min-heap and max-heap', 'Heapify (sift up/down)', 'Array representation', 'Build heap in O(n)'],
        codeExample: {
          title: 'Min-Heap Implementation',
          language: 'javascript',
          code: 'class MinHeap {\n  constructor() { this.heap = []; }\n  parent(i) { return Math.floor((i - 1) / 2); }\n  left(i) { return 2 * i + 1; }\n  right(i) { return 2 * i + 2; }\n\n  push(val) {\n    this.heap.push(val);\n    this._siftUp(this.heap.length - 1);\n  }\n\n  pop() {\n    const min = this.heap[0];\n    const last = this.heap.pop();\n    if (this.heap.length) {\n      this.heap[0] = last;\n      this._siftDown(0);\n    }\n    return min;\n  }\n\n  _siftUp(i) {\n    while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {\n      [this.heap[i], this.heap[this.parent(i)]] =\n        [this.heap[this.parent(i)], this.heap[i]];\n      i = this.parent(i);\n    }\n  }\n\n  _siftDown(i) {\n    let smallest = i;\n    const l = this.left(i), r = this.right(i);\n    if (l < this.heap.length && this.heap[l] < this.heap[smallest]) smallest = l;\n    if (r < this.heap.length && this.heap[r] < this.heap[smallest]) smallest = r;\n    if (smallest !== i) {\n      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];\n      this._siftDown(smallest);\n    }\n  }\n}',
          explanation: 'Heap is a complete binary tree stored in an array. Parent at i/2, children at 2i+1, 2i+2. Push: add at end, sift up. Pop: swap root with last, sift down.'
        },
        timeComplexity: 'Push/Pop: O(log n), Build: O(n)',
        spaceComplexity: 'O(n)',
        order: 0
      },
      {
        title: 'Top-K Problems',
        concepts: ['Kth largest/smallest element', 'Top K frequent elements', 'K closest points to origin', 'Sort a nearly sorted array', 'K largest elements from stream'],
        codeExample: {
          title: 'Kth Largest Element',
          language: 'javascript',
          code: '// Using min-heap of size K\nfunction findKthLargest(nums, k) {\n  // Min-heap keeping K largest elements\n  const heap = [];\n  for (const num of nums) {\n    heap.push(num);\n    heap.sort((a, b) => a - b); // simulating heap\n    if (heap.length > k) heap.shift(); // remove smallest\n  }\n  return heap[0]; // Kth largest = smallest in top-K\n}\n\n// Top K Frequent Elements\nfunction topKFrequent(nums, k) {\n  const freq = new Map();\n  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n\n  // Bucket sort approach (O(n))\n  const buckets = Array.from({length: nums.length + 1}, () => []);\n  for (const [num, count] of freq) buckets[count].push(num);\n\n  const result = [];\n  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {\n    result.push(...buckets[i]);\n  }\n  return result.slice(0, k);\n}',
          explanation: 'Kth largest: maintain a min-heap of size K. The root is always the Kth largest. Top K frequent: use bucket sort by frequency for O(n).'
        },
        timeComplexity: 'O(n log k) for heap, O(n) for bucket sort',
        spaceComplexity: 'O(k) or O(n)',
        order: 1
      },
      {
        title: 'Merge & Stream Problems',
        concepts: ['Merge K sorted lists/arrays', 'Find median from data stream', 'Reorganize string (no adjacent duplicates)', 'Task scheduler', 'Smallest range covering K lists'],
        codeExample: {
          title: 'Find Median from Data Stream',
          language: 'javascript',
          code: '// Two heaps: max-heap for lower half, min-heap for upper half\nclass MedianFinder {\n  constructor() {\n    this.lo = []; // max-heap (store negated)\n    this.hi = []; // min-heap\n  }\n\n  addNum(num) {\n    // Add to max-heap (lower half)\n    this.lo.push(-num);\n    this.lo.sort((a, b) => a - b);\n\n    // Balance: move max of lo to hi\n    this.hi.push(-this.lo.shift());\n    this.hi.sort((a, b) => a - b);\n\n    // Keep lo same size or 1 more than hi\n    if (this.lo.length < this.hi.length) {\n      this.lo.push(-this.hi.shift());\n      this.lo.sort((a, b) => a - b);\n    }\n  }\n\n  findMedian() {\n    if (this.lo.length > this.hi.length) return -this.lo[0];\n    return (-this.lo[0] + this.hi[0]) / 2;\n  }\n}',
          explanation: 'Max-heap stores smaller half, min-heap stores larger half. Median is either max-heap top (odd count) or average of both tops (even count).'
        },
        timeComplexity: 'O(log n) per add, O(1) median',
        spaceComplexity: 'O(n)',
        order: 2
      }
    ],
    mcqs: [
      { question: 'A min-heap has the property:', options: ['Root is the largest', 'Root is the smallest', 'Left child < right child', 'Elements are sorted'], correctIndex: 1, explanation: 'In a min-heap, the root is always the minimum element. Every parent is smaller than or equal to its children.', difficulty: 'easy' },
      { question: 'Time complexity of inserting into a heap:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 1, explanation: 'Insert at the end and sift up. Sift up traverses at most log n levels (height of complete binary tree).', difficulty: 'easy' },
      { question: 'Building a heap from n elements takes:', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'Floyd\'s algorithm (heapify bottom-up) builds a heap in O(n), not O(n log n). Most nodes are near leaves with short sift distances.', difficulty: 'medium' },
      { question: 'To find the Kth largest element, use:', options: ['Max-heap of size K', 'Min-heap of size K', 'Sorted array', 'All are equally efficient'], correctIndex: 1, explanation: 'Min-heap of size K: the root is always the Kth largest. Elements smaller than root are discarded. O(n log k).', difficulty: 'medium' },
      { question: 'Find Median from Data Stream uses:', options: ['Single sorted array', 'Two heaps (max-heap for lower, min-heap for upper)', 'BST', 'Queue'], correctIndex: 1, explanation: 'Two heaps split the stream in half. Max-heap holds the smaller half, min-heap the larger. Median is at the tops.', difficulty: 'medium' },
      { question: 'What is the parent index of node at index i in an array-based heap?', options: ['i - 1', 'i / 2', '(i - 1) / 2', '2 * i'], correctIndex: 2, explanation: 'For 0-indexed array: parent of i is floor((i-1)/2). Children of i are at 2i+1 and 2i+2.', difficulty: 'easy' },
      { question: 'Merge K sorted lists using a heap has time complexity:', options: ['O(NK)', 'O(N log K)', 'O(NK log NK)', 'O(N log N)'], correctIndex: 1, explanation: 'Maintain a min-heap of size K (one element from each list). Each of N total elements is pushed/popped once: O(N log K).', difficulty: 'medium' },
      { question: 'A heap sort has time complexity:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'Build heap: O(n). Extract max n times, each O(log n). Total: O(n log n). And it\'s in-place!', difficulty: 'easy' },
      { question: 'Which operation is NOT efficiently supported by a heap?', options: ['Find min/max', 'Insert', 'Delete min/max', 'Search for arbitrary element'], correctIndex: 3, explanation: 'Heaps don\'t support efficient search for arbitrary elements (O(n) worst case). They excel at min/max operations.', difficulty: 'medium' },
      { question: 'Priority Queue is implemented using:', options: ['Array always', 'Linked list always', 'Binary heap (most common)', 'Hash table'], correctIndex: 2, explanation: 'Binary heap is the most common implementation: O(log n) insert and delete-min, O(1) find-min.', difficulty: 'easy' }
    ],
    interviewQuestions: [
      { question: 'Merge K Sorted Lists', answer: 'Min-heap approach: push the head of each list. Pop minimum, add to result. If popped node has next, push that. Time: O(N log K) where N = total nodes, K = number of lists. Divide & Conquer: merge pairs iteratively, also O(N log K).', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Find Median from Data Stream', answer: 'Two heaps: maxHeap (lower half), minHeap (upper half). Adding: push to maxHeap, balance by moving max to minHeap. If minHeap larger, move min back. Median: if same size, average tops. If maxHeap larger, its top. Time: O(log n) add, O(1) find.', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Top K Frequent Elements', answer: 'Method 1: HashMap for frequency + Min-heap of size K: O(n log k). Method 2: HashMap + Bucket Sort by frequency: O(n). Method 3: HashMap + Quickselect: O(n) average. All are valid; bucket sort is simplest for interviews.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook', 'Google'] },
      { question: 'Kth Largest Element in an Array', answer: 'Method 1: Min-heap of size K. Scan array, push to heap. If heap size > K, pop min. Final heap top = Kth largest. O(n log k). Method 2: Quickselect (partition + recurse on one side). O(n) average, O(n²) worst. Method 3: Sort: O(n log n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook', 'Google', 'Microsoft'] },
      { question: 'Reorganize String (no two adjacent chars same)', answer: 'Count frequencies. Use max-heap. Greedily place the most frequent char, then the next most frequent. Alternate. If any char has freq > (n+1)/2, impossible. Time: O(n log 26) = O(n), Space: O(26) = O(1).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'K Closest Points to Origin', answer: 'Method 1: Max-heap of size K based on distance. O(n log k). Method 2: Quickselect to partition around Kth distance. O(n) average. Method 3: Sort by distance. O(n log n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Facebook'] },
      { question: 'Sort a nearly sorted (K-sorted) array', answer: 'Use a min-heap of size K+1. Insert first K+1 elements. Pop min and insert next element. The popped elements come out sorted because no element is more than K positions away from its sorted position. Time: O(n log k), Space: O(k).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google'] }
    ]
  },

  // ============ HASHING ============
  {
    name: 'Hashing',
    slug: 'hashing',
    icon: '#️⃣',
    color: 'lime',
    difficulty: 'beginner',
    estimatedHours: 8,
    description: 'Hash tables provide O(1) average lookup, insertion, and deletion. Master hash maps, hash sets, collision handling, and classic problems like two-sum and frequency counting.',
    order: 14,
    subtopics: [
      {
        title: 'Hash Table Fundamentals',
        concepts: ['Hash function concepts', 'Collision resolution: chaining vs open addressing', 'Load factor and rehashing', 'Time complexity: O(1) average, O(n) worst', 'Hash Map vs Hash Set'],
        codeExample: {
          title: 'Custom Hash Map (Chaining)',
          language: 'javascript',
          code: 'class HashMap {\n  constructor(size = 53) {\n    this.buckets = new Array(size).fill(null).map(() => []);\n    this.size = size;\n  }\n\n  _hash(key) {\n    let hash = 0;\n    for (const ch of String(key)) {\n      hash = (hash * 31 + ch.charCodeAt(0)) % this.size;\n    }\n    return hash;\n  }\n\n  set(key, value) {\n    const idx = this._hash(key);\n    const pair = this.buckets[idx].find(p => p[0] === key);\n    if (pair) pair[1] = value;\n    else this.buckets[idx].push([key, value]);\n  }\n\n  get(key) {\n    const idx = this._hash(key);\n    const pair = this.buckets[idx].find(p => p[0] === key);\n    return pair ? pair[1] : undefined;\n  }\n\n  delete(key) {\n    const idx = this._hash(key);\n    const i = this.buckets[idx].findIndex(p => p[0] === key);\n    if (i !== -1) this.buckets[idx].splice(i, 1);\n  }\n}',
          explanation: 'Chaining: each bucket is a list of key-value pairs. Hash function maps key to bucket index. Collisions are handled by appending to the list.'
        },
        timeComplexity: 'Average: O(1), Worst: O(n)',
        spaceComplexity: 'O(n)',
        order: 0
      },
      {
        title: 'Frequency & Counting',
        concepts: ['Two Sum using hash map', 'Character frequency counting', 'First non-repeating character', 'Count pairs with given difference', 'Subarray sum equals K'],
        codeExample: {
          title: 'Two Sum & Subarray Sum Equals K',
          language: 'javascript',
          code: '// Two Sum: find two numbers that add to target\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [-1, -1];\n}\n\n// Count subarrays with sum = k (prefix sum + hash)\nfunction subarraySum(nums, k) {\n  const prefixCount = new Map([[0, 1]]);\n  let sum = 0, count = 0;\n  for (const num of nums) {\n    sum += num;\n    if (prefixCount.has(sum - k)) {\n      count += prefixCount.get(sum - k);\n    }\n    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);\n  }\n  return count;\n}',
          explanation: 'Two Sum: store complement → index. Subarray Sum: if prefixSum - k seen before, subarrays between those points sum to k.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        order: 1
      },
      {
        title: 'Advanced Hashing Problems',
        concepts: ['Group anagrams', 'Longest consecutive sequence', 'LRU Cache implementation', 'Isomorphic strings', 'Design consistent hashing'],
        codeExample: {
          title: 'Longest Consecutive Sequence',
          language: 'javascript',
          code: '// Find length of longest consecutive sequence\n// [100, 4, 200, 1, 3, 2] → 4 (sequence: 1,2,3,4)\nfunction longestConsecutive(nums) {\n  const set = new Set(nums);\n  let maxLen = 0;\n\n  for (const num of set) {\n    // Only start counting from sequence start\n    if (!set.has(num - 1)) {\n      let current = num;\n      let length = 1;\n      while (set.has(current + 1)) {\n        current++;\n        length++;\n      }\n      maxLen = Math.max(maxLen, length);\n    }\n  }\n  return maxLen;\n}\n\n// Key insight: only start counting from numbers\n// that don\'t have num-1 in the set (sequence starts)',
          explanation: 'Use a Set for O(1) lookup. Only start counting from sequence starts (num-1 not in set). Each element is visited at most twice. Total: O(n).'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        order: 2
      }
    ],
    mcqs: [
      { question: 'The average time complexity of hash table operations is:', options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'], correctIndex: 1, explanation: 'With a good hash function and low load factor, hash operations (insert, delete, lookup) are O(1) on average.', difficulty: 'easy' },
      { question: 'What is a hash collision?', options: ['Hash table is full', 'Two keys map to the same bucket', 'Hash function returns negative', 'Key doesn\'t exist'], correctIndex: 1, explanation: 'A collision occurs when two different keys produce the same hash value, mapping to the same bucket.', difficulty: 'easy' },
      { question: 'Chaining collision resolution uses:', options: ['Linear probing', 'Linked lists at each bucket', 'Re-hashing', 'Binary search'], correctIndex: 1, explanation: 'Chaining stores all colliding elements in a linked list (or other structure) at the same bucket.', difficulty: 'easy' },
      { question: 'Two Sum problem is optimally solved using:', options: ['Sorting + binary search O(n log n)', 'Hash map O(n)', 'Brute force O(n²)', 'All same complexity'], correctIndex: 1, explanation: 'Hash map: one pass, store complement. O(n) time, O(n) space. Most efficient.', difficulty: 'easy' },
      { question: 'Subarray Sum Equals K uses which technique?', options: ['Sliding window', 'Prefix sum + hash map', 'Two pointers', 'Sorting'], correctIndex: 1, explanation: 'Store prefix sum frequencies. If prefixSum - k was seen, those subarrays between sum to k. Works with negative numbers.', difficulty: 'medium' },
      { question: 'The worst-case time complexity of hash table operations is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctIndex: 2, explanation: 'In the worst case (all keys hash to same bucket), operations degrade to O(n) — scanning the entire chain.', difficulty: 'medium' },
      { question: 'Longest Consecutive Sequence can be solved in O(n) using:', options: ['Sorting', 'Hash Set + smart traversal', 'Union-Find', 'Both B and C'], correctIndex: 3, explanation: 'Hash Set: start counting only from sequence starts. Union-Find: union consecutive numbers. Both achieve O(n).', difficulty: 'medium' },
      { question: 'LRU Cache is typically implemented with:', options: ['Array and binary search', 'Hash map + doubly linked list', 'Stack and queue', 'BST'], correctIndex: 1, explanation: 'Hash map for O(1) lookup. Doubly linked list for O(1) removal and insertion at head (most recent). Together: O(1) for all operations.', difficulty: 'medium' },
      { question: 'Load factor of a hash table is:', options: ['Number of elements / number of buckets', 'Number of collisions', 'Hash function output size', 'Memory usage'], correctIndex: 0, explanation: 'Load factor = n / m (elements / buckets). When it exceeds a threshold (e.g., 0.75), the table is resized and rehashed.', difficulty: 'medium' },
      { question: 'Which data structure does NOT allow duplicate keys?', options: ['Array', 'Linked list', 'Hash Set', 'Stack'], correctIndex: 2, explanation: 'A Hash Set stores unique elements only. Inserting a duplicate is a no-op.', difficulty: 'easy' }
    ],
    interviewQuestions: [
      { question: 'Implement an LRU Cache with O(1) get and put', answer: 'Use a Hash Map (key → node) + Doubly Linked List (ordered by recency). Get: if key exists, move node to front, return value. Put: if exists, update value and move to front. If new, add to front. If over capacity, remove tail (least recently used) and its map entry. Time: O(1) for both.', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Group Anagrams', answer: 'For each string, create a key by sorting its characters. Group strings with the same key. Use a Map where key = sorted string, value = list of anagrams. Time: O(n * k log k) where k = max string length. Alternative key: frequency array as string.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'Longest Consecutive Sequence', answer: 'Put all numbers in a HashSet. For each number, check if num-1 exists (if yes, skip — not a sequence start). If it\'s a start, count consecutive numbers. Track max length. Time: O(n), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Amazon'] },
      { question: 'First Non-Repeating Character in a String', answer: 'Use a hash map to count character frequencies. Then scan the string again and return the first character with count 1. Time: O(n), Space: O(26) = O(1). Alternative: use a linked hash map to maintain insertion order.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Goldman Sachs', 'Bloomberg'] },
      { question: 'Subarray Sum Equals K — Count subarrays', answer: 'Prefix sum approach: maintain running sum and a map of {prefixSum: count}. Initialize {0: 1}. For each element, if (sum - k) exists in map, add its count to result. Store/increment current sum in map. Handles negative numbers. Time: O(n), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon'] },
      { question: 'Design a consistent hashing system', answer: 'Use a hash ring (sorted circular array of hash values). Each server gets multiple virtual nodes on the ring. To find server for a key: hash the key, find the next clockwise server. Adding/removing a server only affects adjacent range. Use a balanced BST (TreeMap) for O(log n) lookup.', difficulty: 'hard', frequency: 'medium', companies: ['Amazon', 'Google', 'Uber'] },
      { question: 'Check if two strings are isomorphic', answer: 'Two hash maps: map1 (char in s → char in t) and map2 (char in t → char in s). For each position, if mapping exists, verify it\'s consistent. If not, create mapping. Both maps must be consistent (bijection). Time: O(n), Space: O(charset).', difficulty: 'easy', frequency: 'medium', companies: ['Amazon', 'Google'] }
    ]
  },

  // ============ SORTING & SEARCHING ============
  {
    name: 'Sorting & Searching',
    slug: 'sorting',
    icon: '📈',
    color: 'slate',
    difficulty: 'beginner',
    estimatedHours: 10,
    description: 'Sorting is a building block for many algorithms. Master comparison sorts (merge, quick, heap), non-comparison sorts (counting, radix), and their practical applications.',
    order: 15,
    subtopics: [
      {
        title: 'Comparison-Based Sorting',
        concepts: ['Bubble sort and selection sort', 'Insertion sort (best for small/nearly sorted)', 'Merge sort (stable, O(n log n))', 'Quick sort (in-place, average O(n log n))', 'Heap sort (in-place, guaranteed O(n log n))'],
        codeExample: {
          title: 'Merge Sort & Quick Sort',
          language: 'javascript',
          code: '// Merge Sort\nfunction mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(a, b) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    a[i] <= b[j] ? result.push(a[i++]) : result.push(b[j++]);\n  }\n  return [...result, ...a.slice(i), ...b.slice(j)];\n}\n\n// Quick Sort (Lomuto partition)\nfunction quickSort(arr, lo = 0, hi = arr.length - 1) {\n  if (lo < hi) {\n    const pivot = partition(arr, lo, hi);\n    quickSort(arr, lo, pivot - 1);\n    quickSort(arr, pivot + 1, hi);\n  }\n  return arr;\n}\n\nfunction partition(arr, lo, hi) {\n  const pivot = arr[hi];\n  let i = lo - 1;\n  for (let j = lo; j < hi; j++) {\n    if (arr[j] <= pivot) {\n      i++;\n      [arr[i], arr[j]] = [arr[j], arr[i]];\n    }\n  }\n  [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];\n  return i + 1;\n}',
          explanation: 'Merge sort: divide in half, sort halves, merge. Stable, O(n log n) always, O(n) space. Quick sort: partition around pivot, sort halves. In-place, O(n log n) avg, O(n²) worst.'
        },
        timeComplexity: 'Merge: O(n log n), Quick: O(n log n) avg',
        spaceComplexity: 'Merge: O(n), Quick: O(log n)',
        order: 0
      },
      {
        title: 'Non-Comparison Sorting',
        concepts: ['Counting sort', 'Radix sort', 'Bucket sort', 'When to use non-comparison sorts', 'Lower bound of comparison sorts: O(n log n)'],
        codeExample: {
          title: 'Counting Sort & Radix Sort',
          language: 'javascript',
          code: '// Counting Sort (for integers in known range)\nfunction countingSort(arr, maxVal) {\n  const count = new Array(maxVal + 1).fill(0);\n  for (const num of arr) count[num]++;\n  let idx = 0;\n  for (let val = 0; val <= maxVal; val++) {\n    while (count[val] > 0) {\n      arr[idx++] = val;\n      count[val]--;\n    }\n  }\n  return arr;\n}\n\n// Radix Sort (for non-negative integers)\nfunction radixSort(arr) {\n  const max = Math.max(...arr);\n  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {\n    const buckets = Array.from({length: 10}, () => []);\n    for (const num of arr) {\n      buckets[Math.floor(num / exp) % 10].push(num);\n    }\n    let idx = 0;\n    for (const bucket of buckets) {\n      for (const num of bucket) arr[idx++] = num;\n    }\n  }\n  return arr;\n}',
          explanation: 'Counting sort: count occurrences, fill array. O(n + k). Radix sort: sort by each digit using counting sort. O(d * (n + k)) where d = number of digits.'
        },
        timeComplexity: 'Counting: O(n + k), Radix: O(d(n + k))',
        spaceComplexity: 'O(n + k)',
        order: 1
      },
      {
        title: 'Sorting Applications',
        concepts: ['Merge sort for linked lists', 'Count inversions (merge sort based)', 'Sort by custom comparator', 'Meeting rooms (sort by start/end)', 'Quickselect (Kth element)'],
        codeExample: {
          title: 'Count Inversions',
          language: 'javascript',
          code: '// Count inversions using merge sort\nfunction countInversions(arr) {\n  let count = 0;\n\n  function mergeSort(arr) {\n    if (arr.length <= 1) return arr;\n    const mid = Math.floor(arr.length / 2);\n    const left = mergeSort(arr.slice(0, mid));\n    const right = mergeSort(arr.slice(mid));\n    return merge(left, right);\n  }\n\n  function merge(a, b) {\n    const result = [];\n    let i = 0, j = 0;\n    while (i < a.length && j < b.length) {\n      if (a[i] <= b[j]) {\n        result.push(a[i++]);\n      } else {\n        count += a.length - i; // all remaining in a are inversions\n        result.push(b[j++]);\n      }\n    }\n    return [...result, ...a.slice(i), ...b.slice(j)];\n  }\n\n  mergeSort(arr);\n  return count;\n}',
          explanation: 'During merge step, when right element is smaller, all remaining left elements form inversions with it. This counts inversions in O(n log n).'
        },
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        order: 2
      },
      {
        title: 'Searching Algorithms',
        concepts: ['Linear search', 'Binary search (sorted data)', 'Ternary search (unimodal functions)', 'Exponential search', 'Interpolation search'],
        codeExample: {
          title: 'Exponential & Interpolation Search',
          language: 'javascript',
          code: '// Exponential Search: find range, then binary search\nfunction exponentialSearch(arr, target) {\n  if (arr[0] === target) return 0;\n  let i = 1;\n  while (i < arr.length && arr[i] <= target) i *= 2;\n  return binarySearch(arr, target, i / 2, Math.min(i, arr.length - 1));\n}\n\n// Interpolation Search (uniform distribution)\nfunction interpolationSearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {\n    const pos = lo + Math.floor(\n      ((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo])\n    );\n    if (arr[pos] === target) return pos;\n    arr[pos] < target ? lo = pos + 1 : hi = pos - 1;\n  }\n  return -1;\n}\n// O(log log n) average for uniformly distributed data',
          explanation: 'Exponential search: double the range until overshoot, then binary search. Good for unbounded arrays. Interpolation: estimate position proportionally. O(log log n) for uniform data.'
        },
        timeComplexity: 'Exponential: O(log n), Interpolation: O(log log n) avg',
        spaceComplexity: 'O(1)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'Which sorting algorithm is stable?', options: ['Quick sort', 'Heap sort', 'Merge sort', 'Selection sort'], correctIndex: 2, explanation: 'Merge sort is stable — equal elements maintain their relative order. Quick sort and heap sort are not stable.', difficulty: 'easy' },
      { question: 'The lower bound for comparison-based sorting is:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctIndex: 1, explanation: 'Any comparison-based sort must make at least O(n log n) comparisons in the worst case (information-theoretic lower bound).', difficulty: 'medium' },
      { question: 'Counting sort has time complexity:', options: ['O(n log n)', 'O(n + k)', 'O(n²)', 'O(n)'], correctIndex: 1, explanation: 'Counting sort runs in O(n + k) where k is the range of input values. It\'s linear when k = O(n).', difficulty: 'medium' },
      { question: 'Quick sort\'s worst case occurs when:', options: ['Array is random', 'Pivot is always median', 'Pivot is always min or max', 'Array has duplicates'], correctIndex: 2, explanation: 'When pivot is always the smallest or largest, partitions are maximally unbalanced (size 0 and n-1), giving O(n²).', difficulty: 'medium' },
      { question: 'Which sorting algorithm is best for nearly sorted data?', options: ['Quick sort', 'Merge sort', 'Insertion sort', 'Heap sort'], correctIndex: 2, explanation: 'Insertion sort is O(n) on nearly sorted data — it only needs to shift a few elements. Other algorithms don\'t benefit from near-sortedness.', difficulty: 'easy' },
      { question: 'Counting inversions can be done in O(n log n) using:', options: ['Bubble sort', 'Modified merge sort', 'Hash map', 'Binary search'], correctIndex: 1, explanation: 'During merge sort\'s merge step, when an element from the right subarray is placed before left elements, count those as inversions.', difficulty: 'medium' },
      { question: 'Quickselect finds the Kth element in:', options: ['O(n log n)', 'O(n) average', 'O(k log n)', 'O(n²)'], correctIndex: 1, explanation: 'Quickselect partitions and only recurses on the relevant half. Average: O(n), worst: O(n²). Can be O(n) worst case with median-of-medians.', difficulty: 'medium' },
      { question: 'Which sort is in-place and O(n log n) worst case?', options: ['Quick sort', 'Merge sort', 'Heap sort', 'Counting sort'], correctIndex: 2, explanation: 'Heap sort is in-place (O(1) extra space) and guaranteed O(n log n). Quick sort can be O(n²) worst case. Merge sort needs O(n) space.', difficulty: 'medium' },
      { question: 'Radix sort is NOT comparison-based and works best for:', options: ['Strings of different lengths', 'Integers with bounded number of digits', 'Floating point numbers', 'Negative numbers'], correctIndex: 1, explanation: 'Radix sort processes d digits, each pass O(n). Best when d is constant/small and integers have bounded range.', difficulty: 'medium' },
      { question: 'Tim sort (used in Python and Java) is a hybrid of:', options: ['Quick sort and heap sort', 'Merge sort and insertion sort', 'Bubble sort and selection sort', 'Counting sort and radix sort'], correctIndex: 1, explanation: 'Timsort uses insertion sort for small runs (where it\'s efficient) and merge sort to combine runs. Stable, O(n log n).', difficulty: 'hard' }
    ],
    interviewQuestions: [
      { question: 'Sort an array of 0s, 1s, and 2s without using library sort', answer: 'Dutch National Flag: three pointers (low, mid, high). Process mid: if 0, swap with low; if 1, just advance; if 2, swap with high. Single pass O(n), O(1) space. Alternative: counting sort (count 0s, 1s, 2s, fill array).', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Samsung'] },
      { question: 'Find Kth largest/smallest element without fully sorting', answer: 'Method 1: Quickselect — partition around pivot, recurse only on the relevant side. O(n) average. Method 2: Min-heap of size K for Kth largest. O(n log k). Method 3: Max-heap of size n-k+1 for Kth smallest. Choose based on constraints.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'Count inversions in an array', answer: 'Modified merge sort: during merge, when arr[right] < arr[left], count += remaining elements in left subarray (all form inversions). Total inversions = left inversions + right inversions + split inversions (counted during merge). Time: O(n log n), Space: O(n).', difficulty: 'hard', frequency: 'medium', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'When would you choose merge sort over quick sort?', answer: 'Choose merge sort when: 1) Stability is required (equal elements keep order), 2) Guaranteed O(n log n) is needed (no O(n²) worst case), 3) Sorting linked lists (merge sort is O(1) extra space on linked lists), 4) External sorting (large data on disk). Choose quick sort for: average case performance, in-place sorting, cache friendliness.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Microsoft'] },
      { question: 'Sort a linked list in O(n log n) time', answer: 'Use merge sort on linked list. Find middle using slow/fast pointers. Recursively sort both halves. Merge sorted halves by pointer manipulation (no extra arrays needed). Time: O(n log n), Space: O(log n) for recursion stack. Unlike arrays, linked list merge sort is O(1) extra space.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Facebook'] },
      { question: 'Given an array of meeting intervals, find minimum meeting rooms needed', answer: 'Separate start and end times, sort both. Two pointers: iterate through start times. If start < current end, need new room (increment rooms). Else, a room is freed (increment end pointer). Track max rooms. Time: O(n log n), Space: O(n). Alternative: min-heap of end times.', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Facebook', 'Amazon'] },
      { question: 'Implement a custom sort: sort array such that even numbers come before odd, both groups sorted', answer: 'Separate into even and odd arrays. Sort both. Concatenate even + odd. Time: O(n log n). Or use custom comparator: compare by (isOdd, value). In-place: partition (even/odd) then sort each half.', difficulty: 'easy', frequency: 'medium', companies: ['Amazon', 'Microsoft'] }
    ]
  }
];
