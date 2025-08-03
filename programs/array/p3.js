const { lowerFirst } = require("lodash");

/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    let maxArea = 0;
    let left = 0;
    let right = height.length - 1;

    while (left < right) {
        maxArea = Math.max(maxArea, (right - left) * Math.min(height[left], height[right]));

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    return maxArea;    
};

console.log(maxArea([1,8,6,2,5,4,8,3,7])); // Output: 49
console.log(maxArea([1,1])); // Output: 1
console.log(maxArea([1,2,1])); // Output:2
console.log(maxArea([1,2,3,4,5,6,7,8,9])); // Output: 20




//  * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
//  * 
//  * You may assume that each input would have exactly one solution, and you may not use the same element twice.
//  * 