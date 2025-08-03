/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function(strs) {
   if (!strs.length) return "";

  // Start by assuming the whole first string is the prefix
  let prefix = strs[0];

  for (let i = 1; i < strs.length; i++) {
    // Reduce the prefix until the current string starts with it
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1); // Trim the last character
      if (prefix === "") return "";
    }
  }

  return prefix;
};


//Input: strs = ["flower","flow","flight"]
//Output: "fl"

console.log(longestCommonPrefix(["flower","flow","flight"]))