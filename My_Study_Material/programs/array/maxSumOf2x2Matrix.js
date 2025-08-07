let input = [[1, 2, 3],
[4, 5, 6],
[7, 8, 9]]


function findMaxOfSumInMatrix(arr, num1) {
    let max = 0
    for (let indexOfMainArr = 0; indexOfMainArr < arr.length; indexOfMainArr++) {
        if (indexOfMainArr < num1) {
            let element1 = arr[indexOfMainArr]
            let element2 = arr[indexOfMainArr + 1]
            for (let index = indexOfMainArr; index < 2; index++) {
                let val1 = element1[index] + element1[index + 1]
                let val2 = element2[index] + element2[index + 1]
                max = Math.max(max, (val1 + val2))
            }
        }
    }
    return max
}

console.log( findMaxOfSumInMatrix(input,2));
