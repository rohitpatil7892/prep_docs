// 🔶 Problem:
// Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

// 🔹 Example:
// js
// Copy
// Edit
// Input: nums = [2, 7, 11, 15], target = 9  
// Output: [0, 1]  


function twoSum(arr, sum) {
    let data = new Map()
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        let calculatedSum = sum - element
        if (data.has(calculatedSum)) {
            return [data.get(calculatedSum), index]
        }
        data.set(element, index)
    }
    return false
}

console.log(twoSum([2, 7, 11, 15], 21));
