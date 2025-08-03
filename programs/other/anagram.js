// Input: s1 = “geeks”  s2 = “kseeg”
// Output: true
// Explanation: Both the string have same characters with same frequency. So, they are anagrams.

// Input: s1 = "allergy", s2 = "allergyy"
// Output: false
// Explanation: Although the characters are mostly the same, s2 contains an extra 'y' character. Since the frequency of characters differs, the strings are not anagrams.


function checkString(str1,str2){
    if(str1.length !== str2.length){
        return false
    }

    let sortStr1 = str1.split('').sort().join('')
    let sortStr2 = str2.split('').sort().join('')

    if(sortStr1 !== sortStr2){
        return false
    }

    return true
}


let s1 = 'geeks';
let s2 = 'kseeg';

console.log(checkString(s1,s2))

let s11 = 'allergy';
let s21 = 'allergyy';

console.log(checkString(s11,s21))