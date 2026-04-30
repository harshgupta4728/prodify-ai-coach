// Topics 4-6: Stack & Queue, Trees, Graphs
module.exports = [
  // ============ STACK & QUEUE ============
  {
    name: 'Stack & Queue',
    slug: 'stack-queue',
    icon: '📚',
    color: 'orange',
    difficulty: 'beginner',
    estimatedHours: 8,
    description: 'Stacks (LIFO) and Queues (FIFO) are essential for expression evaluation, BFS/DFS, and monotonic problems. Master both implementations and their classic applications.',
    order: 4,
    subtopics: [
      {
        title: 'Stack Fundamentals',
        concepts: ['LIFO principle', 'Push, pop, peek operations', 'Array-based vs linked list implementation', 'Call stack and recursion', 'Stack overflow and underflow'],
        codeExample: {
          title: 'Stack Implementation & Valid Parentheses',
          language: 'javascript',
          code: 'class Stack {\n  constructor() { this.items = []; }\n  push(val) { this.items.push(val); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n  isEmpty() { return this.items.length === 0; }\n}\n\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (const ch of s) {\n    if ("({[".includes(ch)) stack.push(ch);\n    else if (stack.pop() !== map[ch]) return false;\n  }\n  return stack.length === 0;\n}',
          explanation: 'Valid parentheses is the classic stack problem. Push opening brackets, pop and match for closing brackets.'
        },
        timeComplexity: 'All operations: O(1)',
        spaceComplexity: 'O(n)',
        order: 0
      },
      {
        title: 'Monotonic Stack',
        concepts: ['Next greater element', 'Next smaller element', 'Stock span problem', 'Largest rectangle in histogram', 'Trapping rain water using stack'],
        codeExample: {
          title: 'Next Greater Element',
          language: 'javascript',
          code: 'function nextGreaterElement(arr) {\n  const result = new Array(arr.length).fill(-1);\n  const stack = []; // stores indices\n  for (let i = 0; i < arr.length; i++) {\n    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {\n      result[stack.pop()] = arr[i];\n    }\n    stack.push(i);\n  }\n  return result;\n}\n// [4, 5, 2, 25] → [5, 25, 25, -1]',
          explanation: 'Monotonic stack maintains elements in decreasing order. When a larger element comes, pop all smaller elements — the larger element is their NGE.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        order: 1
      },
      {
        title: 'Queue & Deque',
        concepts: ['FIFO principle', 'Circular queue', 'Double-ended queue (Deque)', 'Priority queue basics', 'BFS using queue'],
        codeExample: {
          title: 'Implement Queue using Two Stacks',
          language: 'javascript',
          code: 'class MyQueue {\n  constructor() {\n    this.pushStack = [];\n    this.popStack = [];\n  }\n  enqueue(val) { this.pushStack.push(val); }\n  dequeue() {\n    if (!this.popStack.length) {\n      while (this.pushStack.length) {\n        this.popStack.push(this.pushStack.pop());\n      }\n    }\n    return this.popStack.pop();\n  }\n  peek() {\n    if (!this.popStack.length) {\n      while (this.pushStack.length) {\n        this.popStack.push(this.pushStack.pop());\n      }\n    }\n    return this.popStack[this.popStack.length - 1];\n  }\n}',
          explanation: 'Two stacks simulate a queue. Push to pushStack, transfer to popStack (reversing order) when needed for dequeue. Amortized O(1) per operation.'
        },
        timeComplexity: 'Amortized O(1) per operation',
        spaceComplexity: 'O(n)',
        order: 2
      },
      {
        title: 'Expression Evaluation',
        concepts: ['Infix to postfix conversion', 'Postfix evaluation', 'Infix to prefix conversion', 'Calculator problems', 'Operator precedence and associativity'],
        codeExample: {
          title: 'Basic Calculator (Evaluate Expression)',
          language: 'javascript',
          code: 'function calculate(s) {\n  const stack = [];\n  let num = 0, sign = 1, result = 0;\n  for (const ch of s) {\n    if (ch >= "0" && ch <= "9") {\n      num = num * 10 + parseInt(ch);\n    } else if (ch === "+") {\n      result += sign * num;\n      num = 0; sign = 1;\n    } else if (ch === "-") {\n      result += sign * num;\n      num = 0; sign = -1;\n    } else if (ch === "(") {\n      stack.push(result);\n      stack.push(sign);\n      result = 0; sign = 1;\n    } else if (ch === ")") {\n      result += sign * num; num = 0;\n      result *= stack.pop(); // sign\n      result += stack.pop(); // prev result\n    }\n  }\n  return result + sign * num;\n}',
          explanation: 'Use a stack to handle parentheses. Push current result and sign when opening paren. Pop and combine when closing.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'What principle does a Stack follow?', options: ['FIFO', 'LIFO', 'Random access', 'Priority-based'], correctIndex: 1, explanation: 'Stack follows Last In First Out (LIFO) — the most recently added element is removed first.', difficulty: 'easy' },
      { question: 'What is the amortized time complexity of dequeue in a Queue implemented with two stacks?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctIndex: 1, explanation: 'Each element is pushed and popped at most twice (once per stack), giving amortized O(1) per operation.', difficulty: 'medium' },
      { question: 'What is a monotonic stack?', options: ['A stack that only grows', 'A stack maintaining elements in sorted (increasing or decreasing) order', 'A stack using two arrays', 'A stack with constant time min'], correctIndex: 1, explanation: 'A monotonic stack maintains elements in strictly increasing or decreasing order by popping elements that violate the order.', difficulty: 'medium' },
      { question: 'What data structure is used for BFS traversal?', options: ['Stack', 'Queue', 'Heap', 'Hash Map'], correctIndex: 1, explanation: 'BFS uses a queue to process nodes level by level (FIFO order).', difficulty: 'easy' },
      { question: 'Which problem is classically solved using a stack?', options: ['Finding shortest path', 'Valid parentheses matching', 'Finding median', 'Sorting an array'], correctIndex: 1, explanation: 'Valid parentheses is the classic stack problem — push opening brackets, match closing brackets against top of stack.', difficulty: 'easy' },
      { question: 'What is the time complexity of the "Largest Rectangle in Histogram" using stack?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n³)'], correctIndex: 2, explanation: 'Using a monotonic stack, we find the nearest smaller element on both sides for each bar in O(n) total.', difficulty: 'hard' },
      { question: 'A circular queue is useful because:', options: ['It\'s faster than a regular queue', 'It efficiently uses space by wrapping around', 'It supports priority', 'It allows random access'], correctIndex: 1, explanation: 'A circular queue reuses empty spaces at the front after dequeue operations, preventing wasted space.', difficulty: 'medium' },
      { question: 'To implement a stack that supports getMin() in O(1), you need:', options: ['A sorted array', 'An auxiliary min stack', 'A binary search tree', 'A hash map'], correctIndex: 1, explanation: 'Maintain an auxiliary stack that tracks the minimum at each level. Push to min stack when new min is found.', difficulty: 'medium' },
      { question: 'What is the postfix notation of "a + b * c"?', options: ['a b c * +', '+ a * b c', 'a b + c *', '* + a b c'], correctIndex: 0, explanation: 'In postfix: operands come before operators. * has higher precedence, so b*c becomes "b c *", then "a b c * +".', difficulty: 'medium' },
      { question: 'DFS traversal of a graph uses:', options: ['Queue', 'Stack (or recursion)', 'Heap', 'Deque'], correctIndex: 1, explanation: 'DFS uses a stack (explicitly or via recursion\'s call stack) to explore as deep as possible before backtracking.', difficulty: 'easy' }
    ],
    interviewQuestions: [
      { question: 'Implement a Min Stack (push, pop, getMin all in O(1))', answer: 'Use two stacks: main stack and min stack. On push: push to main stack; push to min stack only if value <= current min. On pop: pop from main stack; if popped value equals min stack top, pop from min stack too. getMin: return min stack top. All operations O(1). Alternative: push pairs of (value, currentMin) on a single stack.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Google'] },
      { question: 'Largest Rectangle in Histogram', answer: 'Use a monotonic increasing stack of indices. For each bar: while stack top has a taller bar, pop it and calculate area with that bar as height. Width = current index - new stack top - 1. Push current index. After iterating, pop remaining bars similarly. Time: O(n), Space: O(n).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Design a queue using only stacks', answer: 'Use two stacks: inbox and outbox. Enqueue: push to inbox. Dequeue: if outbox is empty, transfer all from inbox to outbox (reverses order); pop from outbox. Amortized O(1) per operation because each element is moved at most twice.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft', 'Apple'] },
      { question: 'Next Greater Element for all elements in an array', answer: 'Use a monotonic decreasing stack (stores indices). Traverse right to left (or left to right with result array). For each element, pop from stack while top <= current. If stack is empty, NGE is -1. Else, NGE is stack top. Push current to stack. Time: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Bloomberg'] },
      { question: 'Evaluate a Reverse Polish Notation (Postfix) expression', answer: 'Use a stack. For each token: if number, push to stack. If operator, pop two operands (b first, then a), compute a op b, push result. Final stack top is the answer. Time: O(n). Handle edge cases: division by zero, negative numbers, integer division.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'LinkedIn'] },
      { question: 'Sliding Window Maximum (using Deque)', answer: 'Use a deque storing indices in decreasing order of values. For each element: remove indices outside window from front. Remove all indices with smaller values from back (they\'ll never be max). Push current index. Front of deque is always the max for current window. Time: O(n).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Celebrity Problem (stack-based approach)', answer: 'A celebrity is known by everyone but knows nobody. Stack approach: push all people. Pop two, eliminate the one who knows the other. Last remaining is candidate. Verify by checking if everyone knows them and they know nobody. Time: O(n).', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Google'] }
    ]
  },

  // ============ TREES ============
  {
    name: 'Trees',
    slug: 'trees',
    icon: '🌳',
    color: 'emerald',
    difficulty: 'intermediate',
    estimatedHours: 15,
    description: 'Trees are hierarchical data structures fundamental to CS. Master binary trees, BSTs, AVL trees, and tree traversal algorithms. Critical for interview success.',
    order: 5,
    subtopics: [
      {
        title: 'Binary Tree Traversals',
        concepts: ['Inorder (Left, Root, Right)', 'Preorder (Root, Left, Right)', 'Postorder (Left, Right, Root)', 'Level order (BFS)', 'Morris traversal (O(1) space)'],
        codeExample: {
          title: 'Tree Traversals',
          language: 'javascript',
          code: 'class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\n// Inorder (iterative)\nfunction inorder(root) {\n  const result = [], stack = [];\n  let curr = root;\n  while (curr || stack.length) {\n    while (curr) { stack.push(curr); curr = curr.left; }\n    curr = stack.pop();\n    result.push(curr.val);\n    curr = curr.right;\n  }\n  return result;\n}\n\n// Level order (BFS)\nfunction levelOrder(root) {\n  if (!root) return [];\n  const result = [], queue = [root];\n  while (queue.length) {\n    const level = [];\n    const size = queue.length;\n    for (let i = 0; i < size; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}',
          explanation: 'Iterative inorder uses a stack to simulate recursion. Level order uses a queue to process nodes level by level.'
        },
        timeComplexity: 'O(n) for all traversals',
        spaceComplexity: 'O(h) for DFS, O(w) for BFS',
        order: 0
      },
      {
        title: 'Binary Search Tree (BST)',
        concepts: ['BST property: left < root < right', 'Search, insert, delete operations', 'Inorder traversal gives sorted order', 'Finding min/max, successor/predecessor', 'Balancing concepts'],
        codeExample: {
          title: 'BST Search and Insert',
          language: 'javascript',
          code: 'function searchBST(root, val) {\n  if (!root || root.val === val) return root;\n  return val < root.val\n    ? searchBST(root.left, val)\n    : searchBST(root.right, val);\n}\n\nfunction insertBST(root, val) {\n  if (!root) return new TreeNode(val);\n  if (val < root.val) root.left = insertBST(root.left, val);\n  else root.right = insertBST(root.right, val);\n  return root;\n}\n\n// Validate BST\nfunction isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) &&\n         isValidBST(root.right, root.val, max);\n}',
          explanation: 'BST search follows left/right based on comparison — O(h). Validation uses min/max bounds passed down recursively.'
        },
        timeComplexity: 'O(h) average O(log n), worst O(n)',
        spaceComplexity: 'O(h)',
        order: 1
      },
      {
        title: 'Tree Properties & Views',
        concepts: ['Height and depth of tree', 'Diameter of binary tree', 'Left/Right/Top/Bottom views', 'Lowest Common Ancestor (LCA)', 'Check balanced tree'],
        codeExample: {
          title: 'Diameter & LCA',
          language: 'javascript',
          code: '// Diameter of Binary Tree\nfunction diameterOfBinaryTree(root) {\n  let diameter = 0;\n  function height(node) {\n    if (!node) return 0;\n    const left = height(node.left);\n    const right = height(node.right);\n    diameter = Math.max(diameter, left + right);\n    return 1 + Math.max(left, right);\n  }\n  height(root);\n  return diameter;\n}\n\n// Lowest Common Ancestor\nfunction lowestCommonAncestor(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const left = lowestCommonAncestor(root.left, p, q);\n  const right = lowestCommonAncestor(root.right, p, q);\n  if (left && right) return root;\n  return left || right;\n}',
          explanation: 'Diameter = longest path between any two nodes = max(leftHeight + rightHeight) at any node. LCA: if both sides return non-null, current node is LCA.'
        },
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        order: 2
      },
      {
        title: 'Tree Construction & Serialization',
        concepts: ['Build tree from inorder + preorder', 'Build tree from inorder + postorder', 'Serialize and deserialize binary tree', 'Construct BST from preorder', 'Convert sorted array to balanced BST'],
        codeExample: {
          title: 'Build Tree from Preorder and Inorder',
          language: 'javascript',
          code: 'function buildTree(preorder, inorder) {\n  if (!preorder.length) return null;\n  const root = new TreeNode(preorder[0]);\n  const mid = inorder.indexOf(preorder[0]);\n  root.left = buildTree(\n    preorder.slice(1, mid + 1),\n    inorder.slice(0, mid)\n  );\n  root.right = buildTree(\n    preorder.slice(mid + 1),\n    inorder.slice(mid + 1)\n  );\n  return root;\n}',
          explanation: 'Preorder\'s first element is root. Find it in inorder to split into left and right subtrees. Recurse on both halves.'
        },
        timeComplexity: 'O(n) with hashmap optimization',
        spaceComplexity: 'O(n)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'Inorder traversal of a BST gives elements in:', options: ['Random order', 'Sorted (ascending) order', 'Reverse sorted order', 'Level order'], correctIndex: 1, explanation: 'In a BST, left < root < right. Inorder (Left, Root, Right) visits nodes in ascending sorted order.', difficulty: 'easy' },
      { question: 'The height of a balanced binary tree with n nodes is:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1, explanation: 'A balanced tree has roughly equal subtrees at each level, giving height O(log n).', difficulty: 'easy' },
      { question: 'What is the worst-case time complexity of search in a BST?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 2, explanation: 'In the worst case (skewed tree, like a linked list), BST search degrades to O(n).', difficulty: 'medium' },
      { question: 'The diameter of a binary tree is:', options: ['The number of nodes', 'The longest path between any two nodes', 'The height of the tree', 'The number of leaves'], correctIndex: 1, explanation: 'Diameter is the number of edges on the longest path between any two nodes in the tree.', difficulty: 'medium' },
      { question: 'To find the Lowest Common Ancestor of two nodes, the recursive approach checks:', options: ['Only left subtree', 'Only right subtree', 'Both subtrees — if both return non-null, current node is LCA', 'Parent pointers'], correctIndex: 2, explanation: 'If the left and right recursive calls both return non-null, it means p and q are on different sides, so current node is the LCA.', difficulty: 'medium' },
      { question: 'Which traversal is used for level-order output of a tree?', options: ['DFS (preorder)', 'DFS (inorder)', 'BFS using a queue', 'DFS (postorder)'], correctIndex: 2, explanation: 'Level-order traversal processes nodes level by level using a queue (BFS approach).', difficulty: 'easy' },
      { question: 'How many unique BSTs can be formed with n distinct keys?', options: ['n!', '2^n', 'Catalan number C(n)', 'n²'], correctIndex: 2, explanation: 'The number of structurally unique BSTs with n keys is the nth Catalan number: C(n) = (2n)! / ((n+1)! * n!).', difficulty: 'hard' },
      { question: 'Morris Inorder Traversal achieves what space complexity?', options: ['O(n)', 'O(log n)', 'O(h)', 'O(1)'], correctIndex: 3, explanation: 'Morris traversal uses threading (temporary modification of tree pointers) to traverse without a stack, achieving O(1) space.', difficulty: 'hard' },
      { question: 'A complete binary tree with n nodes has height:', options: ['n', 'log₂(n)', 'floor(log₂(n))', 'n/2'], correctIndex: 2, explanation: 'In a complete binary tree, all levels are full except possibly the last. Height = floor(log₂(n)).', difficulty: 'medium' },
      { question: 'What data structure is a binary heap typically implemented as?', options: ['Linked list', 'Array', 'BST', 'Hash table'], correctIndex: 1, explanation: 'Binary heaps are typically stored in arrays where for node at index i, children are at 2i+1 and 2i+2.', difficulty: 'easy' }
    ],
    interviewQuestions: [
      { question: 'Find the Lowest Common Ancestor (LCA) of two nodes in a binary tree', answer: 'Recursive approach: If root is null or equals p or q, return root. Recurse on left and right subtrees. If both return non-null, root is the LCA. Otherwise, return whichever is non-null. For BST: if both nodes < root, go left; if both > root, go right; else root is LCA. Time: O(n) for BT, O(h) for BST.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Serialize and Deserialize a Binary Tree', answer: 'Serialize: BFS/preorder traversal, use "null" for missing nodes. Output comma-separated string. Deserialize: Split string, use queue (BFS) or recursion (preorder) to rebuild. Preorder approach: process root, then left subtree, then right subtree. Return null for "null" tokens. Time: O(n).', difficulty: 'hard', frequency: 'high', companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'] },
      { question: 'Check if a binary tree is balanced', answer: 'A tree is balanced if for every node, the height difference between left and right subtrees is ≤ 1. Optimized approach: return -1 for unbalanced, actual height for balanced. If any subtree returns -1, propagate -1 up. Time: O(n), single pass.', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Bloomberg'] },
      { question: 'Convert a Binary Tree to its Mirror (Invert Binary Tree)', answer: 'Recursively swap left and right children of every node. Base case: if node is null, return. Swap node.left and node.right, then recurse on both children. Can also be done iteratively with a queue. Time: O(n), Space: O(h) recursive, O(n) iterative.', difficulty: 'easy', frequency: 'high', companies: ['Google', 'Amazon'] },
      { question: 'Find all root-to-leaf paths that sum to a target', answer: 'DFS with backtracking. Maintain current path and running sum. At each leaf, check if sum equals target. If yes, add path copy to result. Backtrack by removing last element after exploring both children. Time: O(n), Space: O(h) for recursion + O(n) for paths.', difficulty: 'medium', frequency: 'medium', companies: ['Amazon', 'Facebook'] },
      { question: 'Construct Binary Tree from Inorder and Preorder traversal', answer: 'Preorder first element is root. Find root in inorder array — elements to left are left subtree, to right are right subtree. Use a hashmap for O(1) lookup of root position in inorder. Recursively build left and right subtrees. Time: O(n), Space: O(n).', difficulty: 'medium', frequency: 'high', companies: ['Google', 'Amazon', 'Microsoft'] },
      { question: 'Vertical Order Traversal of a Binary Tree', answer: 'Assign each node a column number (root=0, left child=col-1, right child=col+1) and row number. Use BFS/DFS to collect nodes with (col, row, val). Sort by column, then row, then value. Group by column for output. Time: O(n log n) due to sorting.', difficulty: 'hard', frequency: 'medium', companies: ['Amazon', 'Facebook', 'Google'] }
    ]
  },

  // ============ GRAPHS ============
  {
    name: 'Graphs',
    slug: 'graphs',
    icon: '🕸️',
    color: 'red',
    difficulty: 'advanced',
    estimatedHours: 18,
    description: 'Graphs model relationships between entities. Master BFS, DFS, shortest path algorithms (Dijkstra, Bellman-Ford), topological sort, and union-find for connected components.',
    order: 6,
    subtopics: [
      {
        title: 'Graph Representation & Traversals',
        concepts: ['Adjacency matrix vs adjacency list', 'BFS (Breadth-First Search)', 'DFS (Depth-First Search)', 'Connected components', 'Graph types: directed, undirected, weighted'],
        codeExample: {
          title: 'BFS and DFS on Adjacency List',
          language: 'javascript',
          code: '// BFS\nfunction bfs(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  const order = [];\n  while (queue.length) {\n    const node = queue.shift();\n    order.push(node);\n    for (const neighbor of graph[node] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return order;\n}\n\n// DFS\nfunction dfs(graph, start, visited = new Set()) {\n  visited.add(start);\n  const order = [start];\n  for (const neighbor of graph[start] || []) {\n    if (!visited.has(neighbor)) {\n      order.push(...dfs(graph, neighbor, visited));\n    }\n  }\n  return order;\n}',
          explanation: 'BFS explores neighbors first (queue), DFS goes deep first (stack/recursion). Both visit each node once: O(V + E).'
        },
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        order: 0
      },
      {
        title: 'Shortest Path Algorithms',
        concepts: ['BFS for unweighted graphs', 'Dijkstra\'s algorithm (non-negative weights)', 'Bellman-Ford (handles negative weights)', 'Floyd-Warshall (all pairs)', '0-1 BFS'],
        codeExample: {
          title: 'Dijkstra\'s Algorithm',
          language: 'javascript',
          code: 'function dijkstra(graph, start, n) {\n  const dist = new Array(n).fill(Infinity);\n  dist[start] = 0;\n  // Min-heap: [distance, node]\n  const pq = [[0, start]];\n  while (pq.length) {\n    pq.sort((a, b) => a[0] - b[0]);\n    const [d, u] = pq.shift();\n    if (d > dist[u]) continue;\n    for (const [v, w] of graph[u] || []) {\n      if (dist[u] + w < dist[v]) {\n        dist[v] = dist[u] + w;\n        pq.push([dist[v], v]);\n      }\n    }\n  }\n  return dist;\n}\n// graph[u] = [[v1, w1], [v2, w2], ...]',
          explanation: 'Dijkstra greedily processes the nearest unvisited node. Works only with non-negative edge weights. O((V+E) log V) with a proper min-heap.'
        },
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        order: 1
      },
      {
        title: 'Topological Sort & Cycle Detection',
        concepts: ['Topological ordering of DAG', 'Kahn\'s algorithm (BFS-based)', 'DFS-based topological sort', 'Cycle detection in directed graph', 'Cycle detection in undirected graph'],
        codeExample: {
          title: 'Topological Sort (Kahn\'s Algorithm)',
          language: 'javascript',
          code: 'function topologicalSort(n, edges) {\n  const adj = Array.from({length: n}, () => []);\n  const indegree = new Array(n).fill(0);\n  for (const [u, v] of edges) {\n    adj[u].push(v);\n    indegree[v]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) {\n    if (indegree[i] === 0) queue.push(i);\n  }\n  const order = [];\n  while (queue.length) {\n    const u = queue.shift();\n    order.push(u);\n    for (const v of adj[u]) {\n      indegree[v]--;\n      if (indegree[v] === 0) queue.push(v);\n    }\n  }\n  return order.length === n ? order : []; // empty = cycle\n}',
          explanation: 'Kahn\'s BFS: start with nodes having 0 in-degree. Process them, reduce neighbors\' in-degrees. If result has fewer than n nodes, a cycle exists.'
        },
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        order: 2
      },
      {
        title: 'Union-Find (Disjoint Set Union)',
        concepts: ['Union and Find operations', 'Path compression optimization', 'Union by rank/size', 'Connected components counting', 'Kruskal\'s MST algorithm'],
        codeExample: {
          title: 'Union-Find with Path Compression',
          language: 'javascript',
          code: 'class UnionFind {\n  constructor(n) {\n    this.parent = Array.from({length: n}, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n  find(x) {\n    if (this.parent[x] !== x)\n      this.parent[x] = this.find(this.parent[x]); // path compression\n    return this.parent[x];\n  }\n  union(x, y) {\n    const px = this.find(x), py = this.find(y);\n    if (px === py) return false;\n    if (this.rank[px] < this.rank[py]) this.parent[px] = py;\n    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;\n    else { this.parent[py] = px; this.rank[px]++; }\n    return true;\n  }\n}\n// Nearly O(1) amortized per operation (inverse Ackermann)',
          explanation: 'Path compression makes find nearly O(1). Union by rank keeps trees balanced. Together they give inverse Ackermann amortized time.'
        },
        timeComplexity: 'O(α(n)) ≈ O(1) amortized',
        spaceComplexity: 'O(n)',
        order: 3
      }
    ],
    mcqs: [
      { question: 'BFS on a graph uses which data structure?', options: ['Stack', 'Queue', 'Heap', 'Array'], correctIndex: 1, explanation: 'BFS processes nodes level by level using a queue (FIFO).', difficulty: 'easy' },
      { question: 'Dijkstra\'s algorithm fails when:', options: ['Graph has cycles', 'Graph is undirected', 'Graph has negative edge weights', 'Graph is disconnected'], correctIndex: 2, explanation: 'Dijkstra assumes once a node is processed, its distance is final. Negative weights can invalidate this assumption.', difficulty: 'medium' },
      { question: 'What is the time complexity of BFS/DFS on a graph?', options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'], correctIndex: 2, explanation: 'BFS/DFS visits each vertex once and each edge once, giving O(V + E).', difficulty: 'easy' },
      { question: 'Topological sort is possible only on:', options: ['Undirected graphs', 'Directed Acyclic Graphs (DAGs)', 'Complete graphs', 'Weighted graphs'], correctIndex: 1, explanation: 'Topological ordering requires a DAG. If there\'s a cycle, no valid ordering exists.', difficulty: 'medium' },
      { question: 'Union-Find with path compression and union by rank gives:', options: ['O(log n) per operation', 'O(n) per operation', 'O(α(n)) ≈ O(1) amortized', 'O(1) worst case'], correctIndex: 2, explanation: 'With both optimizations, operations take O(α(n)) amortized time, where α is the inverse Ackermann function (practically constant).', difficulty: 'medium' },
      { question: 'Which algorithm finds shortest paths from all vertices to all other vertices?', options: ['Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', 'BFS'], correctIndex: 2, explanation: 'Floyd-Warshall computes shortest paths between all pairs of vertices in O(V³) time.', difficulty: 'medium' },
      { question: 'How do you detect a cycle in an undirected graph?', options: ['Topological sort', 'DFS — if we visit an already-visited node that is not the parent', 'BFS only', 'Check if V = E + 1'], correctIndex: 1, explanation: 'In DFS on undirected graph, if we encounter a visited node that isn\'t the parent of current node, there\'s a cycle.', difficulty: 'medium' },
      { question: 'The number of edges in a complete graph with n vertices is:', options: ['n', 'n²', 'n(n-1)/2', '2^n'], correctIndex: 2, explanation: 'Each pair of vertices has an edge: C(n,2) = n(n-1)/2 edges.', difficulty: 'easy' },
      { question: 'Kruskal\'s algorithm finds:', options: ['Shortest path', 'Maximum spanning tree', 'Minimum spanning tree', 'Topological order'], correctIndex: 2, explanation: 'Kruskal\'s greedily adds edges by weight (smallest first), using Union-Find to avoid cycles, building the MST.', difficulty: 'medium' },
      { question: 'Which algorithm can handle negative weight edges (no negative cycles)?', options: ['Dijkstra', 'Bellman-Ford', 'BFS', 'Prim\'s'], correctIndex: 1, explanation: 'Bellman-Ford relaxes all edges V-1 times and can handle negative weights. It also detects negative cycles.', difficulty: 'medium' }
    ],
    interviewQuestions: [
      { question: 'Number of Islands (count connected components in a grid)', answer: 'Treat the grid as a graph. For each unvisited land cell (\'1\'), run BFS/DFS to mark all connected land cells as visited. Each BFS/DFS call represents one island. Count the number of calls. Time: O(m*n), Space: O(m*n) for visited array. Can also use Union-Find.', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'] },
      { question: 'Detect cycle in a directed graph', answer: 'DFS with 3 colors: WHITE (unvisited), GRAY (in current path), BLACK (fully processed). If we encounter a GRAY node, there\'s a cycle. Alternatively, use Kahn\'s topological sort — if result has fewer than n nodes, cycle exists. Time: O(V + E).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft'] },
      { question: 'Clone a graph (deep copy)', answer: 'Use BFS/DFS with a HashMap mapping original nodes to their clones. For each node: create clone if not in map. For each neighbor: clone the neighbor (if not cloned), add to clone\'s neighbor list. Time: O(V + E), Space: O(V).', difficulty: 'medium', frequency: 'high', companies: ['Facebook', 'Google', 'Amazon'] },
      { question: 'Course Schedule (can you finish all courses?)', answer: 'Model as a directed graph (course prerequisites). Detect if there\'s a cycle using topological sort (Kahn\'s algorithm) or DFS with coloring. If no cycle exists, all courses can be finished. For ordering, return the topological sort result. Time: O(V + E).', difficulty: 'medium', frequency: 'high', companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'] },
      { question: 'Word Ladder (shortest transformation sequence)', answer: 'BFS from beginWord to endWord. At each step, try changing each character to a-z. If the new word is in the dictionary, add to queue. Track distance. Use a set for O(1) lookup. For optimization, use bidirectional BFS. Time: O(M² * N) where M is word length and N is dictionary size.', difficulty: 'hard', frequency: 'high', companies: ['Amazon', 'Google', 'Facebook'] },
      { question: 'Find bridges in an undirected graph', answer: 'Use Tarjan\'s algorithm. DFS with discovery time and low value. An edge (u,v) is a bridge if low[v] > disc[u] (v cannot reach u or any ancestor of u through any other path). Time: O(V + E).', difficulty: 'hard', frequency: 'medium', companies: ['Google', 'Amazon'] },
      { question: 'Shortest path in an unweighted graph', answer: 'Use BFS from the source. BFS naturally finds shortest paths in unweighted graphs because it explores nodes level by level. Distance of any node = its BFS level. Time: O(V + E), Space: O(V).', difficulty: 'easy', frequency: 'high', companies: ['Amazon', 'Microsoft'] }
    ]
  }
];
