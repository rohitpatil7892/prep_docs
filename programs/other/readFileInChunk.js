const fs = require('fs')

const path = './sample.md'

const readStream = fs.createReadStream(path, {encoding: 'utf8', highWaterMark: 1024}) // 1 kb

readStream.on('data',(chunk)=>{
    console.log(chunk)
})

readStream.on('error', (err)=>{
    console.log(err)
})

let dataToWrite = [
    '\nThis is new data want to add for testing of write stream chunk 01',
    '\nThis is new data want to add for testing of write stream chunk 02'
]

const writeStream = fs.createWriteStream(path, {encoding:'utf8'})

for(let index = 0; index< dataToWrite.length; index++){
    let chunk = dataToWrite[index]
   
    setTimeout(()=>{
        writeStream.write(chunk, 'utf8', ()=>{
            if (index == dataToWrite.length - 1) {
                writeStream.end()
            }
        })
    }, 1000)
}

writeStream.on('error',(err)=>{
    console.log(err)
})