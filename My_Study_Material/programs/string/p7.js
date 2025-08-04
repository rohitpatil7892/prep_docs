// Find the repeating character from the string
// Input: tenant
// Output: t,n


function findDuplicate(str) {
    let map = {}
    let result = []
    for (let i = 0; i < str.length; i++) {
        if(!map[str[i]]){
            map[str[i]] = 1
        }else{
            map[str[i]] = map[str[i]] + 1
            result.push(str[i])
        }
    }
    return result
}

console.log(findDuplicate('tenant'))

function findDuplicate1(str){
    let obj = {}
    let result = []
    for (let index = 0; index < str.length; index++) {
        const element = str[index];
        if(!obj[element]){
            obj[element] = 1
        }else{
            obj[element] = obj[element] + 1
            result.push(element)
        }        
    }
    

//    for(let [key,value] of Object.entries(obj)){
//     if(value> 1){
        
//     }
//    }
   return result
}

console.log(findDuplicate1('tenant'))