
function calculateSum(arr,target) {
    if (arr.length < 3) { return false }
    for (let i = 0; i < arr.length -2; i++) {
        for (let j= 0; j < arr.length -1; j++) {
            for (let k= 0; k < arr.length; k++) {
                if(arr[i] + arr[j]+ arr[k]=== target){
                    return true
                }
            }
        }
    }
    return false
}

console.log(calculateSum([1, 4, 6, 8, 10], 22))
console.log(calculateSum([1, 2, 3, 4, 5], 50))
console.log(calculateSum([1, 2], 50))