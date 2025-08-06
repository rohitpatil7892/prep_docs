// Problem:
// Given an array, rotate the elements to the right by k steps.
// Example:
// Input: nums = [1,2,3,4,5,6,7], k = 3  
// Output: [5,6,7,1,2,3,4]

function rotateArrWithKNumber(arr, k) {
    let result = []
    for (let index = 0; index < arr.length; index += k) {
        result.push(arr.slice(index, index + k))
    }
    result = result.reverse()
    return result.flat()
}

console.log(rotateArrWithKNumber([1,2,3,4,5,6,7], 4));
