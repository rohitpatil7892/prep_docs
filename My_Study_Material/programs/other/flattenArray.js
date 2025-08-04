// Convert [1,[5,[4,9]],2,3] to [1,5,4,9,2,3]  or flatten the array
// with/without using Inbuilt functions
// With/without recursion


// Solution 1 with inbuilt functions

const arr = [1, [5, [4, 9]], 2, 3];

const flattenedArray = arr.flat(Infinity);

console.log(flattenedArray);

// Solution 2 without inbuilt functions

let flattenArray = []



function flatDeep(arr, flattenArray) {
    for (let index = 0; index < arr.length; index++) {
        let element = arr[index]

        if (Array.isArray(element)) {
            flattenArray = flatDeep(element, flattenArray)
        } else {
            flattenArray.push(element)
        }
    }
     return flattenArray
}

console.log(flatDeep(arr,flattenArray))