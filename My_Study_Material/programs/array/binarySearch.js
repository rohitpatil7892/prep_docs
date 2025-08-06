let arr = [1, 3, 5, 8, 10, 21, 23, 26, 29, 30]

let target = 23
let left = 0;
let right = arr.length - 1

function binarySearch(left, right, target, arr) {
    if (left > right) { return false }// no element found
    let mid = Math.floor((left + right) / 2)
    if (target == arr[mid]) {
        return arr[mid]
    } else if (mid > left) {
        return binarySearch(mid, right, target, arr)
    } else {
      return binarySearch(left, mid, target, arr)
    }
}

console.log(binarySearch(left, right, target, arr))