// List out key from nested Javascript object like {a:1,b:{c:1,d:{e:5}}}
// Output: a,b,c,d,e

const obj = { a: 1, b: { c: 1, d: { e: 5 } } };
let result = []
function parseKey(obj, result){
    for(let key in obj){
        result.push(key)
        if( typeof obj[key] === 'object' && obj[key] !== null){
            parseKey(obj[key], result)
        }
    }
    return result 
}
console.log(parseKey(obj,result))