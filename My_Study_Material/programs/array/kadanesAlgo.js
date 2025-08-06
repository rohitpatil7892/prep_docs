// Given an array of integers (positive, negative, or zero), find the maximum sum of any contiguous subarray.

// Kadane’s Algorithm Intuition
// You iterate through the array and at each position:

// Keep track of the maximum sum subarray that ends at that index.

// If the current sum becomes negative, start a new subarray from the next element.

let arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]


function calKadaneAlgo(arr) {
    let currentSum = 0
    let maxSum = 0

    // Rule = max(element, currentSum+element)
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        currentSum = Math.max(element, currentSum + element)
        maxSum = Math.max(currentSum, maxSum)
    }
    return maxSum
}

console.log(calKadaneAlgo(arr))