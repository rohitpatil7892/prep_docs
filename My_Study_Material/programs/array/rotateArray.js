let input = [[1, 2, 3],
[4, 5, 6],
[7, 8, 9]]

function rotateArray(arr){
let rotateArray = []
    for (let index = 0; index < arr.length; index++) {
        let subArray = []
        for (let subIndex = 0; subIndex < arr.length; subIndex++) {
            subArray.push(arr[subIndex][index])
        }
        rotateArray.push(subArray)
    }
    return rotateArray
}

console.log(rotateArray(input));
