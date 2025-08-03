/**
 * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.
Example 1:

Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
Example 2:

Input: nums = [3,2,4], target = 6
Output: [1,2]
Example 3:

Input: nums = [3,3], target = 6
Output: [0,1]
 * 
 * 
 * 
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
// var twoSum = function (nums, target) {
//     let targetReturn = [];
//     for (let index = 0; index < nums.length; index++) {
//         if (index < nums.length - 1) {
//             let calNum = nums[index] + nums[index + 1];
//             if (calNum == target) {
//                 targetReturn[0] = nums[index];
//                 targetReturn[1] = nums[index + 1];
//             }
//         }
//     }
//     return targetReturn;
// };

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let numMap = new Map(); // A mapping to store numbers and their indices
    for (let i = 0; i < nums.length; i++) {
        let complement = target - nums[i]; // Find the required number to reach the target
        if (numMap.has(complement)) {
            return [numMap.get(complement), i]; // Return indices of the complement and current number
        }
        numMap.set(nums[i], i); // Store the number with its index
    }
    return []; // This line is never reached due to the problem guarantee
};


console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 2, 4], 6));
console.log(twoSum([3, 3], 6));
