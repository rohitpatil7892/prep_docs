Array.prototype.MyUpperCase = function (){
    for(let index = 0; index < this.length; index++){
        this[index] = this[index].toUpperCase()
    }
    return this
}

var fruits = ["Banana", "Orange", "Apple", "Mango"];
console.log(fruits.MyUpperCase())