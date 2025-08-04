
// Group the Anagrams together ["ate","eat","tan","nat","ant"]
// Output	[["ate","eat"],["tan","nat","ant"]]

let arr = ["ate", "eat", "tan", "nat", "ant"]

let obj ={}
for (let i = 0; i < arr.length; i++) {
    let el = arr[i]
    el = el.split('').sort().join('')

    if(!obj[el]){
        obj[el] = []
    }
    obj[el].push(arr[i])
}

console.log(obj)