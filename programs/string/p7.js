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

