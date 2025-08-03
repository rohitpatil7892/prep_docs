// Write a function for input Welcome to world! to print emocleW ot !dlrow 


let str = "Welcome to world!"

let result = str.split(' ').map((item)=> {
    return item.split('').reverse().join('')
}).join(' ')


console.log(result)