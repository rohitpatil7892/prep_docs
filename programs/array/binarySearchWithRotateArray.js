const arr = [3, 4, 5, 6, 7, 0, 1, 2];
const target = 0;

function sortedArrayWithBinary(arr, target, left = 0, right = arr.length - 1) {
    let mid = Math.floor((left + right) / 2)

    if (arr[mid] == target) { return mid }

    if (arr[left] < arr[mid]) {
        if (arr[left] <= target && target < arr[mid]) {
            return sortedArrayWithBinary(arr, target, left, mid)
        } else {
            return sortedArrayWithBinary(arr, target, mid, right)
        }
    } else {
        if (arr[right] <= target && target < arr[mid]) {
            return sortedArrayWithBinary(arr, target, mid, right)
        } else {
            return sortedArrayWithBinary(arr, target, left, mid)
        }
    }
}

console.log(sortedArrayWithBinary(arr,target))