function checkDuplicate(arr){
    let data = new Map()
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if(data.has(element)){
            return true
        }
        data.set(element, index)
        
    }
    return false
}

console.log(checkDuplicate([1,2,3,1]));
console.log(checkDuplicate([1,2,3,4]));

