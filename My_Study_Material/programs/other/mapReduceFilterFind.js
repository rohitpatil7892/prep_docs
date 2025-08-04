let arr = [
    {price: 100},
    {price: 20},
    {price: 30},
    {price: 70},
    {price: 80}
]

let mapResult = arr.map((item)=> {
    if(item.price> 50){
        item.price = item.price - 50
    }
    return item
})

console.log(mapResult)

let filterResult = arr.filter((item)=> {
    if(item.price < 50){
        return item
    }
})

console.log(filterResult)

let findResult = arr.find((item)=> item.price == 30)

console.log(findResult)

let reduceResult = arr.reduce((sum, item) => sum + item.price, 0)

console.log(reduceResult)