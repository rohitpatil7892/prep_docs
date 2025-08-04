// Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

// An input string is valid if:

// Open brackets must be closed by the same type of brackets.
// Open brackets must be closed in the correct order.
// Every close bracket has a corresponding open bracket of the same type.
 

// Example 1:

// Input: s = "()"

// Output: true

// Example 2:

// Input: s = "()[]{}"

// Output: true

// Example 3:

// Input: s = "(]"

// Output: false

// Example 4:

// Input: s = "([])"

// Output: true

// Example 5:

// Input: s = "([)]"

// Output: false

 const isValid = (s) => {
    let stk = []

    for (let i = 0; i < s.length; i++){
        let el = s[i]
        if(el == '(' || el == '{' || el == '['){
            stk.push(el)
        }else if(el == ')' || el == '}' || el == ']'){
            let left = stk.pop()

            if(el == ')' && left !== '(' ||
                el == '}' && left !== '{' ||
                el == ']' && left !== '['
            )
            {
                return false;
            }
        }
    }
    return stk.length === 0
}


console.log(isValid("()[]{}")) // true
console.log(isValid("(]")) // false
console.log(isValid("([)]")) // false
console.log(isValid("([])")) // true