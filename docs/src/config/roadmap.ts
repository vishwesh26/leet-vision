export interface SubTopicConfig {
  title: string;
  slug: string;
  order: number;
}

export interface TopicConfig {
  title: string;
  slug: string;
  order: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subtopics: SubTopicConfig[];
}

export interface StageConfig {
  title: string;
  slug: string;
  topics: TopicConfig[];
}

export const learningRoadmap: StageConfig[] = [
  {
    title: "Stage 1 — Fundamentals",
    slug: "stage-1-fundamentals",
    topics: [
      {
        title: "Complexity Analysis",
        slug: "complexity-analysis",
        order: 1,
        category: "Stage 1 — Fundamentals",
        difficulty: "Easy",
        subtopics: [
          { title: "Introduction to Complexity", slug: "introduction-to-complexity", order: 1 },
          { title: "Time Complexity", slug: "time-complexity", order: 2 },
          { title: "Space Complexity", slug: "space-complexity", order: 3 },
          { title: "Big O Notation", slug: "big-o-notation", order: 4 },
          { title: "Big Theta Notation", slug: "big-theta-notation", order: 5 },
          { title: "Big Omega Notation", slug: "big-omega-notation", order: 6 },
          { title: "Complexity Cheat Sheet", slug: "complexity-cheat-sheet", order: 7 },
          { title: "Interview Tips & Common Pitfalls", slug: "complexity-interview-tips", order: 8 },
          { title: "Practice Problems", slug: "complexity-practice-problems", order: 9 }
        ]
      },
      {
        title: "Arrays",
        slug: "arrays",
        order: 2,
        category: "Stage 1 — Fundamentals",
        difficulty: "Easy",
        subtopics: [
          { title: "Introduction to Arrays", slug: "array-introduction", order: 1 },
          { title: "Array Traversal", slug: "array-traversal", order: 2 },
          { title: "Insertion & Deletion", slug: "array-insertion-deletion", order: 3 },
          { title: "Array Rotation", slug: "array-rotation", order: 4 },
          { title: "Prefix Sum Basics", slug: "array-prefix-sum", order: 5 },
          { title: "Difference Array technique", slug: "array-difference", order: 6 },
          { title: "Kadane's Algorithm", slug: "kadanes-algorithm", order: 7 },
          { title: "Cyclic Sort Pattern", slug: "cyclic-sort", order: 8 },
          { title: "Frequency Counting on Arrays", slug: "array-frequency", order: 9 }
        ]
      },
      {
        title: "Strings",
        slug: "strings",
        order: 3,
        category: "Stage 1 — Fundamentals",
        difficulty: "Easy",
        subtopics: [
          { title: "String Basics & Storage", slug: "string-basics", order: 1 },
          { title: "Character Frequency maps", slug: "string-frequency", order: 2 },
          { title: "Palindrome Problems", slug: "string-palindrome", order: 3 },
          { title: "Anagram Detection", slug: "string-anagram", order: 4 },
          { title: "String Compression Techniques", slug: "string-compression", order: 5 },
          { title: "Basic Pattern Matching", slug: "string-pattern-matching", order: 6 }
        ]
      },
      {
        title: "Hashing",
        slug: "hashing",
        order: 4,
        category: "Stage 1 — Fundamentals",
        difficulty: "Easy",
        subtopics: [
          { title: "HashMap Data Structure", slug: "hash-map", order: 1 },
          { title: "HashSet Data Structure", slug: "hash-set", order: 2 },
          { title: "Frequency Mapping patterns", slug: "hash-frequency-mapping", order: 3 },
          { title: "Counting Problems with Hashing", slug: "hash-counting-problems", order: 4 },
          { title: "Hash Collision Basics", slug: "hash-collisions", order: 5 }
        ]
      },
      {
        title: "Linked Lists",
        slug: "linked-lists",
        order: 5,
        category: "Stage 1 — Fundamentals",
        difficulty: "Medium",
        subtopics: [
          { title: "Singly Linked List", slug: "singly-linked-list", order: 1 },
          { title: "Doubly Linked List", slug: "doubly-linked-list", order: 2 },
          { title: "Reversing a Linked List", slug: "reverse-linked-list", order: 3 },
          { title: "Detecting Cycle (Floyd's algorithm)", slug: "detect-cycle-linked-list", order: 4 },
          { title: "Merging Two Sorted Lists", slug: "merge-sorted-lists", order: 5 },
          { title: "Intersection of Two Lists", slug: "intersection-linked-lists", order: 6 }
        ]
      },
      {
        title: "Stacks",
        slug: "stacks",
        order: 6,
        category: "Stage 1 — Fundamentals",
        difficulty: "Medium",
        subtopics: [
          { title: "Stack Basics & Implementations", slug: "stack-basics", order: 1 },
          { title: "Valid Parentheses Problem", slug: "valid-parentheses", order: 2 },
          { title: "Min Stack Design", slug: "min-stack", order: 3 },
          { title: "Monotonic Stack Pattern", slug: "monotonic-stack-basics", order: 4 },
          { title: "Next Greater Element", slug: "next-greater-element", order: 5 }
        ]
      },
      {
        title: "Queues",
        slug: "queues",
        order: 7,
        category: "Stage 1 — Fundamentals",
        difficulty: "Medium",
        subtopics: [
          { title: "Queue Basics & Operations", slug: "queue-basics", order: 1 },
          { title: "Double Ended Queue (Deque)", slug: "deque-basics", order: 2 },
          { title: "Circular Queue implementation", slug: "circular-queue", order: 3 },
          { title: "Priority Queue Introduction", slug: "priority-queue-basics", order: 4 }
        ]
      }
    ]
  },
  {
    title: "Stage 2 — Interview Patterns",
    slug: "stage-2-interview-patterns",
    topics: [
      {
        title: "Two Pointers",
        slug: "two-pointers",
        order: 1,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Opposite Direction Pointers", slug: "opposite-pointers", order: 1 },
          { title: "Same Direction Pointers", slug: "same-direction-pointers", order: 2 },
          { title: "Slow & Fast Pointer (Tortoise and Hare)", slug: "slow-fast-pointer", order: 3 },
          { title: "Remove Duplicates Pattern", slug: "remove-duplicates-pointers", order: 4 },
          { title: "Pair Sum problems", slug: "pair-sum-pointers", order: 5 },
          { title: "Container With Most Water", slug: "container-with-most-water", order: 6 }
        ]
      },
      {
        title: "Sliding Window",
        slug: "sliding-window",
        order: 2,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Introduction to Sliding Window", slug: "sliding-window-introduction", order: 1 },
          { title: "How Sliding Window Works", slug: "how-sliding-window-works", order: 2 },
          { title: "How to Identify Sliding Window Problems", slug: "identify-sliding-window", order: 3 },
          { title: "Fixed Size Window Pattern", slug: "fixed-sliding-window", order: 4 },
          { title: "Variable Size Window Pattern", slug: "variable-sliding-window", order: 5 },
          { title: "Longest Substring Window Pattern", slug: "longest-window", order: 6 },
          { title: "Minimum Window Substring Pattern", slug: "minimum-window", order: 7 },
          { title: "Frequency Map Window Pattern", slug: "frequency-window", order: 8 },
          { title: "Common Interview Questions", slug: "sliding-window-questions", order: 9 }
        ]
      },
      {
        title: "Prefix Sum Pattern",
        slug: "prefix-sum-pattern",
        order: 3,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "1D Prefix Sum Pattern", slug: "prefix-sum-1d", order: 1 },
          { title: "2D Prefix Sum Pattern", slug: "prefix-sum-2d", order: 2 },
          { title: "Difference Array technique (Range Updates)", slug: "difference-array-range-updates", order: 3 }
        ]
      },
      {
        title: "Binary Search",
        slug: "binary-search",
        order: 4,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Introduction to Binary Search", slug: "binary-search-introduction", order: 1 },
          { title: "How to Identify Binary Search Problems", slug: "identify-binary-search", order: 2 },
          { title: "Classic Binary Search", slug: "classic-binary-search", order: 3 },
          { title: "Finding Lower Bound", slug: "binary-search-lower-bound", order: 4 },
          { title: "Finding Upper Bound", slug: "binary-search-upper-bound", order: 5 },
          { title: "Binary Search on Answer", slug: "binary-search-on-answer", order: 6 },
          { title: "Find Peak Element", slug: "find-peak-element", order: 7 },
          { title: "Rotated Sorted Array Search", slug: "binary-search-rotated-array", order: 8 }
        ]
      },
      {
        title: "Sorting Patterns",
        slug: "sorting-patterns",
        order: 5,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Custom Sorting Mechanisms", slug: "custom-sorting", order: 1 },
          { title: "Custom Comparator", slug: "custom-comparator", order: 2 },
          { title: "Interval Sorting Pattern", slug: "interval-sorting", order: 3 },
          { title: "Merge Intervals Pattern", slug: "merge-intervals", order: 4 },
          { title: "Insert Interval Pattern", slug: "insert-interval", order: 5 },
          { title: "Meeting Rooms Pattern", slug: "meeting-rooms", order: 6 }
        ]
      },
      {
        title: "Top K Elements Pattern",
        slug: "top-k-elements",
        order: 6,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Heap Data Structures", slug: "heap-top-k", order: 1 },
          { title: "Priority Queue usage", slug: "priority-queue-top-k", order: 2 },
          { title: "Top K Largest Elements", slug: "top-k-largest", order: 3 },
          { title: "Top K Smallest Elements", slug: "top-k-smallest", order: 4 }
        ]
      },
      {
        title: "Monotonic Stack Patterns",
        slug: "monotonic-stack-patterns",
        order: 7,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Hard",
        subtopics: [
          { title: "Next Greater Element", slug: "next-greater-monotonic", order: 1 },
          { title: "Previous Greater Element", slug: "previous-greater-monotonic", order: 2 },
          { title: "Largest Rectangle in Histogram", slug: "largest-rectangle-histogram", order: 3 },
          { title: "Daily Temperatures Problem", slug: "daily-temperatures-stack", order: 4 }
        ]
      },
      {
        title: "Monotonic Queue Patterns",
        slug: "monotonic-queue-patterns",
        order: 8,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Hard",
        subtopics: [
          { title: "Sliding Window Maximum", slug: "sliding-window-maximum", order: 1 },
          { title: "Sliding Window Minimum", slug: "sliding-window-minimum", order: 2 }
        ]
      },
      {
        title: "Greedy Algorithms",
        slug: "greedy-algorithms",
        order: 9,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Medium",
        subtopics: [
          { title: "Greedy Pattern Introduction", slug: "greedy-introduction", order: 1 },
          { title: "How to Identify Greedy Problems", slug: "identify-greedy", order: 2 },
          { title: "Interval Scheduling Pattern", slug: "interval-scheduling-greedy", order: 3 },
          { title: "Jump Game Series", slug: "jump-game-greedy", order: 4 },
          { title: "Gas Station Problem", slug: "gas-station-greedy", order: 5 }
        ]
      },
      {
        title: "Backtracking Patterns",
        slug: "backtracking-patterns",
        order: 10,
        category: "Stage 2 — Interview Patterns",
        difficulty: "Hard",
        subtopics: [
          { title: "Backtracking Introduction", slug: "backtracking-introduction", order: 1 },
          { title: "How to Identify Backtracking Problems", slug: "identify-backtracking", order: 2 },
          { title: "Generating Subsets", slug: "subsets-backtracking", order: 3 },
          { title: "Generating Permutations", slug: "permutations-backtracking", order: 4 },
          { title: "Combination Sum series", slug: "combination-sum-backtracking", order: 5 },
          { title: "N-Queens Solver", slug: "n-queens-backtracking", order: 6 },
          { title: "Sudoku Solver implementation", slug: "sudoku-solver-backtracking", order: 7 }
        ]
      }
    ]
  },
  {
    title: "Stage 3 — Trees",
    slug: "stage-3-trees",
    topics: [
      {
        title: "Binary Tree Basics",
        slug: "binary-tree-basics",
        order: 1,
        category: "Stage 3 — Trees",
        difficulty: "Medium",
        subtopics: [
          { title: "Binary Tree Introduction", slug: "binary-tree-intro", order: 1 },
          { title: "Pre-order, In-order, Post-order (DFS) Traversals", slug: "tree-dfs-traversals", order: 2 },
          { title: "Level Order Traversal (BFS)", slug: "tree-bfs-traversals", order: 3 },
          { title: "Height of Binary Tree", slug: "binary-tree-height", order: 4 },
          { title: "Diameter of Binary Tree", slug: "binary-tree-diameter", order: 5 },
          { title: "Balanced Binary Tree validation", slug: "balanced-binary-tree", order: 6 },
          { title: "Lowest Common Ancestor (LCA)", slug: "lowest-common-ancestor", order: 7 },
          { title: "Maximum Path Sum in Trees", slug: "maximum-path-sum", order: 8 },
          { title: "Serialization and Deserialization", slug: "serialize-deserialize-binary-tree", order: 9 }
        ]
      },
      {
        title: "Binary Search Trees",
        slug: "binary-search-trees",
        order: 2,
        category: "Stage 3 — Trees",
        difficulty: "Medium",
        subtopics: [
          { title: "Searching in BST", slug: "search-bst", order: 1 },
          { title: "Insertion in BST", slug: "insert-bst", order: 2 },
          { title: "Deletion in BST", slug: "delete-bst", order: 3 },
          { title: "Validate Binary Search Tree", slug: "validate-bst", order: 4 },
          { title: "Kth Smallest Element in BST", slug: "kth-smallest-bst", order: 5 }
        ]
      },
      {
        title: "Heaps",
        slug: "heaps",
        order: 3,
        category: "Stage 3 — Trees",
        difficulty: "Medium",
        subtopics: [
          { title: "Min Heap implementation", slug: "min-heap", order: 1 },
          { title: "Max Heap implementation", slug: "max-heap", order: 2 },
          { title: "Heapify Algorithm", slug: "heapify-algorithm", order: 3 },
          { title: "Priority Queue design", slug: "priority-queue-design", order: 4 }
        ]
      },
      {
        title: "Tries",
        slug: "tries",
        order: 4,
        category: "Stage 3 — Trees",
        difficulty: "Medium",
        subtopics: [
          { title: "Trie Introduction & Structure", slug: "trie-introduction", order: 1 },
          { title: "Trie Insertion logic", slug: "trie-insert", order: 2 },
          { title: "Trie Search logic", slug: "trie-search", order: 3 },
          { title: "Trie StartsWith prefix search", slug: "trie-starts-with", order: 4 },
          { title: "Design Add and Search Words", slug: "word-dictionary-trie", order: 5 },
          { title: "Autocomplete Systems using Tries", slug: "autocomplete-trie", order: 6 }
        ]
      }
    ]
  },
  {
    title: "Stage 4 — Graphs",
    slug: "stage-4-graphs",
    topics: [
      {
        title: "Graph Basics",
        slug: "graph-basics",
        order: 1,
        category: "Stage 4 — Graphs",
        difficulty: "Medium",
        subtopics: [
          { title: "Graph Representation (Matrix/List)", slug: "graph-representation", order: 1 },
          { title: "Depth First Search (DFS) on Graphs", slug: "graph-dfs", order: 2 },
          { title: "Breadth First Search (BFS) on Graphs", slug: "graph-bfs", order: 3 },
          { title: "Finding Connected Components", slug: "graph-connected-components", order: 4 },
          { title: "Cycle Detection in Undirected Graph", slug: "cycle-undirected-graph", order: 5 },
          { title: "Cycle Detection in Directed Graph", slug: "cycle-directed-graph", order: 6 },
          { title: "Topological Sort introduction", slug: "topological-sort-intro", order: 7 },
          { title: "Kahn's Algorithm (BFS topological sort)", slug: "kahns-algorithm", order: 8 },
          { title: "DFS Topological Sort", slug: "dfs-topological-sort", order: 9 }
        ]
      },
      {
        title: "Shortest Paths",
        slug: "shortest-paths",
        order: 2,
        category: "Stage 4 — Graphs",
        difficulty: "Hard",
        subtopics: [
          { title: "Dijkstra's Algorithm", slug: "dijkstras-algorithm", order: 1 },
          { title: "Bellman-Ford Algorithm", slug: "bellman-ford-algorithm", order: 2 },
          { title: "Floyd-Warshall Algorithm", slug: "floyd-warshall-algorithm", order: 3 }
        ]
      },
      {
        title: "Minimum Spanning Tree",
        slug: "minimum-spanning-tree",
        order: 3,
        category: "Stage 4 — Graphs",
        difficulty: "Hard",
        subtopics: [
          { title: "Prim's Algorithm", slug: "prims-algorithm", order: 1 },
          { title: "Kruskal's Algorithm", slug: "kruskals-algorithm", order: 2 }
        ]
      },
      {
        title: "Union Find",
        slug: "union-find",
        order: 4,
        category: "Stage 4 — Graphs",
        difficulty: "Medium",
        subtopics: [
          { title: "Union Find Basics (Disjoint Set)", slug: "union-find-basics", order: 1 },
          { title: "Path Compression optimization", slug: "path-compression-union-find", order: 2 },
          { title: "Union By Rank/Size", slug: "union-by-rank", order: 3 }
        ]
      },
      {
        title: "Advanced Graphs",
        slug: "advanced-graphs",
        order: 5,
        category: "Stage 4 — Graphs",
        difficulty: "Hard",
        subtopics: [
          { title: "Bridges in Graphs (Tarjan's)", slug: "bridges-graphs", order: 1 },
          { title: "Articulation Points", slug: "articulation-points", order: 2 },
          { title: "Strongly Connected Components (Kosaraju)", slug: "strongly-connected-components", order: 3 }
        ]
      }
    ]
  },
  {
    title: "Stage 5 — Dynamic Programming",
    slug: "stage-5-dynamic-programming",
    topics: [
      {
        title: "Dynamic Programming Introduction",
        slug: "dp-introduction",
        order: 1,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "How to Identify DP Problems", slug: "identify-dp", order: 1 },
          { title: "Memoization Pattern (Top-down)", slug: "dp-memoization", order: 2 },
          { title: "Tabulation Pattern (Bottom-up)", slug: "dp-tabulation", order: 3 },
          { title: "Formulating State Transitions", slug: "dp-state-transitions", order: 4 }
        ]
      },
      {
        title: "1D Dynamic Programming",
        slug: "1d-dp",
        order: 2,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "Fibonacci Sequence optimization", slug: "fibonacci-dp", order: 1 },
          { title: "Climbing Stairs Problem", slug: "climbing-stairs-dp", order: 2 },
          { title: "House Robber Problem", slug: "house-robber-dp", order: 3 }
        ]
      },
      {
        title: "2D Dynamic Programming",
        slug: "2d-dp",
        order: 3,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "Unique Paths in Grids", slug: "unique-paths-dp", order: 1 },
          { title: "Grid Minimum Path Sum", slug: "grid-path-sum-dp", order: 2 }
        ]
      },
      {
        title: "Knapsack Patterns",
        slug: "knapsack-patterns",
        order: 4,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "0/1 Knapsack Pattern", slug: "0-1-knapsack-dp", order: 1 },
          { title: "Unbounded Knapsack Pattern", slug: "unbounded-knapsack-dp", order: 2 }
        ]
      },
      {
        title: "Longest Increasing Subsequence",
        slug: "longest-increasing-subsequence",
        order: 5,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "LIS Tabulation & Optimization", slug: "lis-basics", order: 1 }
        ]
      },
      {
        title: "Longest Common Subsequence",
        slug: "longest-common-subsequence",
        order: 6,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Medium",
        subtopics: [
          { title: "LCS Tabulation and Memory Optimization", slug: "lcs-basics", order: 1 },
          { title: "Edit Distance Problem", slug: "edit-distance-dp", order: 2 }
        ]
      },
      {
        title: "Palindromic DP Pattern",
        slug: "palindromic-dp",
        order: 7,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Hard",
        subtopics: [
          { title: "Longest Palindromic Substring/Subsequence", slug: "palindromic-subsequence-dp", order: 1 }
        ]
      },
      {
        title: "Partition DP Pattern",
        slug: "partition-dp",
        order: 8,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Hard",
        subtopics: [
          { title: "Matrix Chain Multiplication (MCM)", slug: "matrix-chain-multiplication", order: 1 }
        ]
      },
      {
        title: "Specialized DP Techniques",
        slug: "specialized-dp",
        order: 9,
        category: "Stage 5 — Dynamic Programming",
        difficulty: "Hard",
        subtopics: [
          { title: "Digit DP technique", slug: "digit-dp", order: 1 },
          { title: "Bitmask DP technique", slug: "bitmask-dp", order: 2 }
        ]
      }
    ]
  },
  {
    title: "Stage 6 — Advanced",
    slug: "stage-6-advanced",
    topics: [
      {
        title: "Advanced Data Structures",
        slug: "advanced-structures",
        order: 1,
        category: "Stage 6 — Advanced",
        difficulty: "Hard",
        subtopics: [
          { title: "Segment Tree", slug: "segment-tree", order: 1 },
          { title: "Fenwick Tree (Binary Indexed Tree)", slug: "fenwick-tree", order: 2 },
          { title: "Sparse Table", slug: "sparse-table", order: 3 },
          { title: "Binary Lifting technique", slug: "binary-lifting", order: 4 },
          { title: "Euler Tour on Trees", slug: "euler-tour-trees", order: 5 },
          { title: "Heavy Light Decomposition (HLD)", slug: "heavy-light-decomposition", order: 6 }
        ]
      },
      {
        title: "Advanced String Algorithms",
        slug: "advanced-string-algorithms",
        order: 2,
        category: "Stage 6 — Advanced",
        difficulty: "Hard",
        subtopics: [
          { title: "Rolling Hash & Rabin-Karp", slug: "rolling-hash-rabin-karp", order: 1 },
          { title: "Knuth-Morris-Pratt (KMP) Algorithm", slug: "kmp-algorithm", order: 2 },
          { title: "Z Algorithm", slug: "z-algorithm", order: 3 },
          { title: "Aho-Corasick Automaton", slug: "aho-corasick", order: 4 }
        ]
      },
      {
        title: "Miscellaneous Advanced Techniques",
        slug: "misc-advanced",
        order: 3,
        category: "Stage 6 — Advanced",
        difficulty: "Hard",
        subtopics: [
          { title: "Mo's Algorithm (Query Square Root Decomposition)", slug: "mos-algorithm", order: 1 },
          { title: "Convex Hull (Geometry)", slug: "convex-hull", order: 2 },
          { title: "Sweep Line Algorithms", slug: "sweep-line", order: 3 },
          { title: "Trie Bit Manipulation (XOR maximums)", slug: "trie-bit-manipulation", order: 4 },
          { title: "Meet In The Middle Technique", slug: "meet-in-the-middle", order: 5 },
          { title: "Solving Interactive Problems", slug: "interactive-problems", order: 6 }
        ]
      }
    ]
  }
];
