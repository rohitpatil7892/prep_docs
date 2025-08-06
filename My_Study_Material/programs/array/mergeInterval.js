// Problem Statement:
// Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.
// 🔸 Example:
// Input:  [[1,3],[2,6],[8,10],[15,18]]  
// Output: [[1,6],[8,10],[15,18]]

function mergeInterval(arr) {
    let interval = arr.sort((a, b) => a[0] - b[0])
    let merge = []

    let startPointer = 0
    let endPointer = 0
    for (let i = 0; i < interval.length; i++) {
        const element = interval[i];
        if (i == 0) {
            merge.push(element)
        }
        if (merge[merge.length-1][1] > interval[i][0]) {
            merge[merge.length-1][1] = interval[i][1]
        } else {
            merge.push(element)
        }
        startPointer = element[0]
        endPointer = element[1]
    }
    return merge
}
console.log(mergeInterval([[1,3],[2,6],[8,10],[15,18]]));
