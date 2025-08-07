// Input: nums = [1,3,-1,-3,5,3,6,7], k = 3  
// Output: [3,3,5,5,6,7]


function slidingWindow(arr, max) {
    let result = []
    for (let indexOfMainArr = 0; indexOfMainArr < arr.length; indexOfMainArr++) {
        if ((indexOfMainArr + max) < arr.length + 1) {
            let subArray = []
            for (let index = indexOfMainArr; index < (indexOfMainArr + max); index++) {
                subArray.push(arr[index])
            }
            let sum = Math.max(...subArray)
            result.push(sum)
        }
    }
    return result
}

console.log(slidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
