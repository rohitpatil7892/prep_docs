const _ = require("lodash");

const names = [{ name: "john" }, { name: "paul" }, { name: "john" }];
const uniqueNames = _.uniqBy(names, "name");
console.log(uniqueNames);







