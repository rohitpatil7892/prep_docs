let arr = [1, 3, 5, 8, 10, 21, 23, 26, 29, 30]

let target = 23
let left = 0
let right = arr.length - 1

function binarySearch(arr, target, left, right) {
    if (left > right) { return -1 }
    let mid = Math.floor((left + right) / 2)
    if (arr[mid] == target) {
        return mid;
    } else if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid)
    } else {
        return binarySearch(arr, target, mid, right)
    }
}

console.log(binarySearch(arr,target, left, right))