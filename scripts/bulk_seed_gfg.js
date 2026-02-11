const axios = require('axios');

const GFG_PROBLEMS = [
    // Array
    "Pair with the given Sum", "Best Time to Buy and Sell Stock", "Product of Array Except Self",
    "Maximum Subarray", "Container With Most Water", "Factorial of a large number",
    "Trapping Rain Water", "Insert and Merge Intervals", "Merge Intervals",
    "Second Largest Element", "Third Largest Element", "Reverse an Array",
    "Reverse Array in Groups", "Rotate Array", "Three Great Candidates",
    "Max Consecutive Ones", "Move All Zeroes To End", "Wave Array", "Plus One",
    "Stock Buy and Sell – One Transaction", "Stock Buy and Sell – Multiple Transactions",
    "Remove Duplicates from Sorted Array", "Alternate Positive Negative", "Array Leaders",
    "Missing and Repeating in Array", "Missing Ranges of Numbers", "Sum of all Subarrays",
    "Next Permutation", "Majority Element", "Majority Element II", "Minimize the Heights II",
    "Maximum Subarray Sum", "Maximum Product Subarray", "Subarrays with Product Less Than K",
    "Split Into Three Equal Sum Segments", "Maximum Consecutive 1s After Flipping 0s",
    "Last Moment Before Ants Fall Out of Plank", "Find 0 with Farthest 1s in a Binary",
    "Intersection of Interval Lists", "Rearrange Array Elements by Sign",
    "Meeting Scheduler for Two Persons", "Longest Mountain Subarray", "Transform and Sort Array",
    "Minimum Swaps To Group All Ones", "Minimum Moves To Equalize Array",
    "Minimum Indices To Equal Even-Odd Sums", "Maximum Circular Subarray Sum",
    "Smallest Missing Positive Number", "Jump Game", "Closest Subsequence Sum",
    "Smallest Non-Representable Sum in Array", "Smallest Range Having Elements From K Lists",
    "Count Subarrays with K Distinct Elements", "Next Smallest Palindrome",
    "Maximum Sum Among All Rotations",

    // Matrix
    "Rotate Matrix Elements", "Sort the matrix", "Turn image by 90-degree",
    "Multiply two matrices", "Maximum element of each row in a matrix",
    "Count sorted rows in a matrix", "Common elements in all rows of matrix",
    "Print matrix in snake pattern", "Sort a Matrix in all way increasing order",
    "Row with maximum 1s", "Sums of diagonals of a matrix", "Array subset Check",
    "Boundary elements of a Matrix", "Magic square", "Peak Element in 2D matrix",
    "Matrix Median", "Rotate matrix by 90 degree without extra space",
    "Rotate Matrix by 180 degree", "Rotate the matrix right by K times",
    "Print a given matrix in spiral form", "Zigzag (or diagonal) traversal of Matrix",
    "Spiral Traversal of Matrix", "Search in a Row Column Sorted Matrix",
    "Find the number of islands", "Boolean Matrix Question",
    "Count number of islands in a binary matrix", "Maximum sum rectangle in a 2D matrix",
    "Flood Fill Algorithm", "Count Paths in matrix", "Maximum path sum in matrix",
    "Rotate a matrix by 90 degrees", "Minimum steps to reach target by a Knight",
    "Minimum cost to fill the weight", "Shortest path in a Binary Maze",
    "Largest binary sub-matrix with all 1s", "Largest rectangular area in histogram",
    "Find pair in a matrix", "Maximum size square sub-matrix with all 1s",
    "Largest rectangle of 1's with swapping of columns", "Maximum sum rectangular submatrix",
    "Minimum Points to Reach Destination", "Number of paths with at-most k turns",
    "Boolean Matrix", "Matrix Chain Multiplication", "Ancestor Matrix from a Given Binary Tree",
    "Print K’th element in spiral form of matrix", "Size of the largest ‘+’ in a binary matrix",
    "Maximum sum square sub-matrix of given size", "Tic-Tac-Toe Validity",

    // String
    "Palindrome Check", "Reverse a String", "Reverse Words", "Check for Rotation",
    "First Non Repeating", "Roman to Integer", "Implement Atoi", "Encrypt the String – II",
    "Equal Point in Brackets", "Anagram Checking", "Panagram Checking", "Validate IP Address",
    "Add Binary Strings", "Integer to Words", "Fizz Buzz", "Palindromic Sentence Check",
    "Isomorphic Strings", "Check for k-anagram", "Equal 0,1, and 2", "Find and replace in String",
    "Look and say Pattern", "Minimum repetitions to make Substring", "Excel Sheet – I",
    "Find the N-th character", "Next Palindromic Number with same digits",
    "Length of longest prefix suffix", "Longest K unique characters substring",
    "Smallest window containing all", "Longest substring without repeating characters",
    "Substrings of length k with k-1 distinct elements", "Count number of substrings",
    "Interleaved Strings", "Print Anagrams together", "Rank the permutation",
    "A Special Keyboard", "Sum of two large numbers", "Repeatedly Remove Duplicates",
    "Multiply Two Strings", "Search Pattern (KMP-Algorithm)", "Search Pattern (Rabin-Karp Algorithm)",
    "Shortest Common Supersequence", "Longest substring to form a Palindrome",
    "Longest Valid Parenthesis", "Longest Palindromic Subsequence", "Distinct Palindromic Substrings",
    "Palindrome Substring Queries", "Number of Distinct Subsequences",
    "Minimum Deletions for Palindrome", "Minimum Insertions for Palindrome",
    "Max Non-Overlapping Odd Palindrome Sum",

    // Linked List
    "Middle of a linked list", "Reverse a Linked List", "Reverse a Doubly Linked List",
    "Rotate a linked list", "Nth node from End", "Delete Last Occurrence",
    "Delete Middle", "Merge Alternate Positions", "Circular List Traversal",
    "Queue using Linked List", "Stack using singly linked list", "Pairwise Swap",
    "Count Occurrences", "Detect Loop", "Length of the Loop", "Reverse in groups",
    "Intersection Point", "Delete without Head pointer", "Merge two sorted linked lists",
    "Sort a List of 0s, 1s and 2s", "Palindrome Linked List", "Remove all occurrences of a given list",
    "Split a Circular Linked List into two halves", "Pair Sum in Doubly Linked List",
    "Add two numbers represented by Linked lists", "Multiply two numbers represented by Linked Lists",
    "Swap Kth nodes from beginning and end", "Rotate Doubly linked list by N nodes",
    "Binary Tree to Doubly Linked List", "Linked List from a 2D matrix", "Reverse a Sublist",
    "Delete N nodes after M", "Rearrange a given linked list in-place", "Partition around a given value",
    "Remove loop in Linked List", "LRU Cache", "LFU Cache", "Merge k Sorted Linked Lists",
    "Reverse Alternate K Nodes", "Flattening a Linked List", "Clone with random pointers",

    // Stack / Queue
    "Parenthesis Checker", "Reverse a String using Stack", "Postfix to Prefix",
    "Two stacks in an array", "Delete Middle element from stack", "Reverse individual words",
    "Queue using Stacks", "Stack using Queues", "Stack using single queue",
    "Evaluate Postfix Expression", "Next Greater Element", "Nearest Smaller Element",
    "Next Smaller of next Greater", "Sort a stack using a temporary stack",
    "Stock Span Problem", "Reverse a Stack using recursion", "Infix to Postfix",
    "Delete consecutive same words", "A Stack with getMin() in O(1) Time",
    "Count of Subarrays with first as minimum", "Length of the longest valid substring",
    "Index of closing bracket", "Next Greater Frequency Element", "Max Diff between nearest smallers",
    "Max product of indexes of next greater", "The Celebrity Problem", "Valid stack permutation",
    "Stack with getMin() in O(1)", "Stack with getRandom() in O(1)", "Equivalent expressions",
    "k stacks in a single array", "Largest rectangular area in a histogram",
    "Clone a Stack without Extra Space", "Custom Browser History", "Maximum Rectangle with all 1s",
    "Sort a stack using Recursion", "Stack with findMiddle() and deleteMiddle()",
    "Maximum visible people", "Count distinct Max Differences in Subarrays",
    "Longest Correct Bracket Subsequence Set", "Maximum of minimum for every window size",
    "Circular Array Implementation", "Linked List Implementation", "Flipping Bits with K-Window",
    "Interleave the first and second halves", "Check if a queue can be sorted",
    "Generate Binary Numbers", "Implement Stack using Queues", "Implement Stack using Two Queues",
    "Implement Queue using Two Stacks", "Implement a Queue using a Stack",
    "Reverse a queue using recursion", "Minimum steps to reach target by a Knight",
    "First negative integer in every window of size k", "Minimum time required to rot all oranges",
    "Shortest safe route in a path with landmines", "First circular tour that visits all petrol pumps",
    "Reverse First k of Queue", "First non-repeating in a Stream", "Snake and Ladder Problem",
    "Minimum Cost Path via given intermediates"
];

const API_BASE = "http://localhost:5000/api";

async function bulkSeed() {
    console.log(`Starting API-based bulk seeding for ${GFG_PROBLEMS.length} GFG problems...`);
    const unique = [...new Set(GFG_PROBLEMS)];

    try {
        const response = await axios.post(`${API_BASE}/universe/bulk-seed`, {
            problems: unique,
            platform: 'geeksforgeeks'
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.error("Failed:", err.response ? err.response.data : err.message);
    }
}

bulkSeed();
