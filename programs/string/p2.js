// Given a string s, return the longest palindromic substring in s.

 

// Example 1:

// Input: s = "babad"
// Output: "bab"
// Explanation: "aba" is also a valid answer.
// Example 2:

// Input: s = "cbbd"
// Output: "bb"

// expand around center
// 1. expand around the center
// 2. check if the substring is a palindrome
// 3. return the longest palindrome

/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
    if (s.length <= 1) return s;   

    let start = 0;   
    let end   = 0;   
  
    for (let i = 0; i < s.length; i++) {
    
      let [l1, r1] = expand(i, i, s);
      if (r1 - l1 > end - start) {
        start = l1
        end = r1
      }
      // even length palindrome
      let [l2, r2] = expand(i, i + 1, s);
      if (r2 - l2 > end - start) {
        start = l2
        end = r2
      }
    }
  
    return s.slice(start, end + 1);
};

function expand(l, r, s){
    while(l>=0 && r<s.length && s[l] === s[r]){
        l--
        r++
    }
    return [l+1, r-1]
}

console.log(longestPalindrome("babad")); // "bab" or "aba"
console.log(longestPalindrome("cbbd")); // "bb"
console.log(longestPalindrome("a")); // "a"
console.log(longestPalindrome("ac")); // "a"
console.log(longestPalindrome("abaxyabcdcba")); // "aba"