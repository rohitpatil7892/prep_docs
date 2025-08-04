const _ = require('lodash');


let arr = [1,2,[3,4,[5,6,[7,8,[9,10]]]]];
let result = _.flattenDeep(arr);
console.log(result);



// Example usage