// Input: s = "abcabcbb"
// Output: 3
// Explanation: The answer is "abc", with the length of 3.

// Input: s = "bbbbb"
// Output: 1
// Explanation: The answer is "b".

// Input: s = "pwwkew"
// Output: 3
// Explanation: The answer is "wke".



function slidingWindow(str) {
    let data = new Set()
    for (let index = 0; index < str.length; index++) {
        let subStringCombination = new Set()
        for (let strIndex = index; strIndex < str.length; strIndex++) {
            if (subStringCombination.has(str[strIndex])) {
                data.add([...subStringCombination].join(''))
                break
            }
            subStringCombination.add(str[strIndex])
        }
    }
    let orderedStr = [...data].sort((a, b) => b.length - a.length)
    return orderedStr[0]

}

console.log(slidingWindow('abcabcbb'));
console.log(slidingWindow('bbbbb'));
console.log(slidingWindow('pwwkew'));
