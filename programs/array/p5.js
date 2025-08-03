// Find the maximum product of triplets from an array
// [5,7,8,3,6] = 6*8*7 Answer: Array elements could be negative values as well.


function findMaxMultiplicationNumber(arr) {
    if (arr.length < 3) { return null }
    let newArr = arr.sort((a,b)=> a-b)
    let arrLen = arr.length
    let solution1 = newArr[arrLen - 1] * newArr[arrLen - 2] * newArr[arrLen -3]
    let solution2 = newArr[0] * newArr[1] * newArr[arrLen - 1]
    return Math.max(solution1, solution2)
}

console.log(findMaxMultiplicationNumber([5,7,8,3,6]))
console.log(findMaxMultiplicationNumber([5,7]))
console.log(findMaxMultiplicationNumber([5, 7, 8, 3, -6]))