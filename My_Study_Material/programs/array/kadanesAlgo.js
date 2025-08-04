// Given an array of integers (positive, negative, or zero), find the maximum sum of any contiguous subarray.

// Kadane’s Algorithm Intuition
// You iterate through the array and at each position:

// Keep track of the maximum sum subarray that ends at that index.

// If the current sum becomes negative, start a new subarray from the next element.

let arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]


function calKadaneAlgo(arr) {
    let maxSoFar = arr[0]
    let maxEnding = arr[0]
    for (let i = 0; i < arr.length; i++) {
        maxEnding = Math.max(arr[i], maxEnding + arr[i])
        maxSoFar = Math.max(maxSoFar, maxEnding)
    }
    return maxSoFar
}

console.log(calKadaneAlgo(arr))