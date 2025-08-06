// Problem:
// Move all 0s to the end of the array while maintaining the relative order of the non-zero elements.

// Example:

// js
// Copy
// Edit
// Input: [0,1,0,3,12]  
// Output: [1,3,12,0,0]


function movePointers(arr){
    let newArr = []

    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if(element !== 0){
            newArr.push(element)
        }
    }

    for (let index = newArr.length; index < arr.length; index++) {
        newArr.push(0)
    }

    return newArr
}

console.log(movePointers([0,1,0,3,12]));
