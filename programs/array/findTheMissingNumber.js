function findMissingNumber(arr) {
    let l = arr.length + 1
    let requiredSum = (l * (l + 1) / 2)
    let actualSum = arr.reduce((acc, num) => acc + num, 0)
    return requiredSum - actualSum

}



console.log(findMissingNumber([1, 2, 4, 5]))
console.log(findMissingNumber([1, 2, 3, 4, 6]))