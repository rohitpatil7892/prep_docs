// Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]] such that:
// i != j != k
// nums[i] + nums[j] + nums[k] == 0ß
// 🔹 Example:
// Input: nums = [-1, 0, 1, 2, -1, -4]  
// Output: [[-1, -1, 2], [-1, 0, 1]]



function findThreeSumNumber(arr, num) {
    let result = []
    for (let index1 = 0; index1 < arr.length; index1++) {
        for (let index2 = index1; index2 < arr.length; index2++) {
            for (let index3 = index2; index3 < arr.length; index3++) {
                if (arr[index1] + arr[index2] + arr[index3] == num) {
                    result.push([arr[index1], arr[index2], arr[index3]])
                }
            }
        }
    }
    return result
}
console.log(findThreeSumNumber([-1, 0, 1, 2, -1, -4], 2));
