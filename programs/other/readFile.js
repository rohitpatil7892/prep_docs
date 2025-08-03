// const fs = require('fs')

const path = './readFiles.js'


// try {
// const data = fs.readFileSync(path, 'utf8')
// console.log(data)
// } catch (err) {
//     console.log(err)
// }


const fs = require('fs/promises')


async function readMyFile(){
try{
    const data = await fs.readFile(path, 'utf8')
    console.log(data)
}catch(err){
console.log(err)
}
}

readMyFile()