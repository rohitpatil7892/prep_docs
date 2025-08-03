# 🧠 Data Structures & Algorithms Interview Questions

## Table of Contents
1. [Arrays & Strings](#arrays--strings)
2. [Linked Lists](#linked-lists)
3. [Stacks & Queues](#stacks--queues)
4. [Trees & Binary Trees](#trees--binary-trees)
5. [Graphs](#graphs)
6. [Dynamic Programming](#dynamic-programming)
7. [Sorting & Searching](#sorting--searching)
8. [Hash Tables](#hash-tables)
9. [Recursion & Backtracking](#recursion--backtracking)
10. [Advanced Topics](#advanced-topics)

---

## 📊 Arrays & Strings

### Q1: Two Sum Problem
**Problem:** Given an array of integers and a target sum, return indices of two numbers that add up to the target.

**Solution 1: Brute Force**
```javascript
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}

// Time Complexity: O(n²)
// Space Complexity: O(1)
```

**Solution 2: Hash Map (Optimal)**
```javascript
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

// Time Complexity: O(n)
// Space Complexity: O(n)
```

**Explanation:** The hash map approach stores each number with its index as we iterate. For each number, we check if its complement (target - current number) exists in the map.

### Q2: Valid Anagram
**Problem:** Check if two strings are anagrams of each other.

**Solution:**
```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    
    const charCount = {};
    
    // Count characters in first string
    for (const char of s) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    
    // Subtract characters from second string
    for (const char of t) {
        if (!charCount[char]) return false;
        charCount[char]--;
    }
    
    return true;
}

// Time Complexity: O(n)
// Space Complexity: O(1) - at most 26 characters
```

### Q3: Maximum Subarray (Kadane's Algorithm)
**Problem:** Find the contiguous subarray with the largest sum.

**Solution:**
```javascript
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

---

## 🔗 Linked Lists

### Q4: Reverse a Linked List
**Problem:** Reverse a singly linked list.

**Solution:**
```javascript
function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const nextTemp = current.next;
        current.next = prev;
        prev = current;
        current = nextTemp;
    }
    
    return prev;
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

### Q5: Detect Cycle in Linked List
**Problem:** Determine if a linked list has a cycle.

**Solution:**
```javascript
function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head.next;
    
    while (slow !== fast) {
        if (!fast || !fast.next) return false;
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return true;
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

---

## 📚 Stacks & Queues

### Q6: Valid Parentheses
**Problem:** Check if parentheses are valid (properly opened and closed).

**Solution:**
```javascript
function isValid(s) {
    const stack = [];
    const mapping = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (const char of s) {
        if (char in mapping) {
            if (stack.length === 0 || stack.pop() !== mapping[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}

// Time Complexity: O(n)
// Space Complexity: O(n)
```

### Q7: Min Stack
**Problem:** Design a stack that supports push, pop, top, and retrieving minimum element in O(1).

**Solution:**
```javascript
class MinStack {
    constructor() {
        this.stack = [];
        this.minStack = [];
    }
    
    push(val) {
        this.stack.push(val);
        
        if (this.minStack.length === 0 || val <= this.getMin()) {
            this.minStack.push(val);
        }
    }
    
    pop() {
        const popped = this.stack.pop();
        
        if (popped === this.getMin()) {
            this.minStack.pop();
        }
        
        return popped;
    }
    
    top() {
        return this.stack[this.stack.length - 1];
    }
    
    getMin() {
        return this.minStack[this.minStack.length - 1];
    }
}

// Time Complexity: O(1) for all operations
// Space Complexity: O(n)
```

---

## 🌳 Trees & Binary Trees

### Q8: Maximum Depth of Binary Tree
**Problem:** Find the maximum depth of a binary tree.

**Solution:**
```javascript
function maxDepth(root) {
    if (!root) return 0;
    
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
}

// Time Complexity: O(n)
// Space Complexity: O(h) where h is tree height
```

### Q9: Binary Tree Inorder Traversal
**Problem:** Traverse a binary tree in inorder (left, root, right).

**Solution:**
```javascript
function inorderTraversal(root) {
    const result = [];
    
    function inorder(node) {
        if (!node) return;
        
        inorder(node.left);
        result.push(node.val);
        inorder(node.right);
    }
    
    inorder(root);
    return result;
}

// Time Complexity: O(n)
// Space Complexity: O(h)
```

### Q10: Validate Binary Search Tree
**Problem:** Check if a binary tree is a valid BST.

**Solution:**
```javascript
function isValidBST(root) {
    function validate(node, min, max) {
        if (!node) return true;
        
        if (node.val <= min || node.val >= max) {
            return false;
        }
        
        return validate(node.left, min, node.val) && 
               validate(node.right, node.val, max);
    }
    
    return validate(root, -Infinity, Infinity);
}

// Time Complexity: O(n)
// Space Complexity: O(h)
```

---

## 🕸️ Graphs

### Q11: Number of Islands
**Problem:** Count the number of islands in a 2D grid.

**Solution:**
```javascript
function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    
    function dfs(i, j) {
        if (i < 0 || i >= rows || j < 0 || j >= cols || grid[i][j] === '0') {
            return;
        }
        
        grid[i][j] = '0'; // Mark as visited
        
        dfs(i + 1, j);
        dfs(i - 1, j);
        dfs(i, j + 1);
        dfs(i, j - 1);
    }
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === '1') {
                count++;
                dfs(i, j);
            }
        }
    }
    
    return count;
}

// Time Complexity: O(m × n)
// Space Complexity: O(m × n)
```

---

## 🎯 Dynamic Programming

### Q12: Climbing Stairs
**Problem:** Find number of ways to climb n stairs (can climb 1 or 2 steps at a time).

**Solution:**
```javascript
function climbStairs(n) {
    if (n <= 1) return 1;
    
    let prev2 = 1;
    let prev1 = 1;
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

### Q13: House Robber
**Problem:** Rob houses to maximize money without robbing adjacent houses.

**Solution:**
```javascript
function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    
    let prev2 = 0;
    let prev1 = 0;
    
    for (const num of nums) {
        const current = Math.max(prev1, prev2 + num);
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

---

## 🔍 Sorting & Searching

### Q14: Binary Search
**Problem:** Search for a target value in a sorted array.

**Solution:**
```javascript
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// Time Complexity: O(log n)
// Space Complexity: O(1)
```

### Q15: Merge Sort
**Problem:** Implement merge sort algorithm.

**Solution:**
```javascript
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// Time Complexity: O(n log n)
// Space Complexity: O(n)
```

---

## 🗂️ Hash Tables

### Q16: Group Anagrams
**Problem:** Group strings that are anagrams of each other.

**Solution:**
```javascript
function groupAnagrams(strs) {
    const map = new Map();
    
    for (const str of strs) {
        const sorted = str.split('').sort().join('');
        
        if (!map.has(sorted)) {
            map.set(sorted, []);
        }
        
        map.get(sorted).push(str);
    }
    
    return Array.from(map.values());
}

// Time Complexity: O(n × m log m)
// Space Complexity: O(n × m)
```

---

## 🔄 Recursion & Backtracking

### Q17: Generate Parentheses
**Problem:** Generate all valid combinations of n pairs of parentheses.

**Solution:**
```javascript
function generateParenthesis(n) {
    const result = [];
    
    function backtrack(current, open, close) {
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }
        
        if (open < n) {
            backtrack(current + '(', open + 1, close);
        }
        
        if (close < open) {
            backtrack(current + ')', open, close + 1);
        }
    }
    
    backtrack('', 0, 0);
    return result;
}

// Time Complexity: O(4^n / √n)
// Space Complexity: O(4^n / √n)
```

---

## 🚀 Advanced Topics

### Q18: LRU Cache
**Problem:** Design and implement a Least Recently Used (LRU) cache.

**Solution:**
```javascript
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return -1;
    }
    
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
}

// Time Complexity: O(1) for both get and put
// Space Complexity: O(capacity)
```

---

## 📊 Time & Space Complexity Quick Reference

### Common Time Complexities:
- **O(1)** - Constant time
- **O(log n)** - Logarithmic time
- **O(n)** - Linear time
- **O(n log n)** - Linearithmic time
- **O(n²)** - Quadratic time
- **O(2^n)** - Exponential time

### Problem-Solving Tips:
1. **Understand the problem** thoroughly
2. **Start with brute force** then optimize
3. **Identify patterns** and data structures
4. **Consider edge cases**
5. **Analyze time/space complexity**
6. **Test with examples**

This guide covers essential DSA concepts for technical interviews! 