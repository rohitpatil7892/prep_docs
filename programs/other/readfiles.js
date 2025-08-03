const fsPromises = require('fs/promises');

// readfile using promise
function readFileUsingPromise(filename) {
    try {
        return fsPromises.readFile(filename, 'utf8')
    } catch (err) {
        throw err;
    }
}


// readFileUsingPromise('clustor.js')
//     .then(data => {
//         console.log(JSON.stringify(data));
//     })
//     .catch(err => {
//         console.log(err);
//     })


// readfile using async await
async function readFileUsingAsyncAwait(filename) {
    try {
        return await fsPromises.readFile(filename, 'utf8')
    } catch (err) {
        throw err;
    }
}

async function callReadFile() {
    try {
        let data = await readFileUsingAsyncAwait('clustor.js')
        console.log(JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
}

// callReadFile()


async function readFileUsingPromiseAll(){
    let data = await Promise.all([
        await readFileUsingAsyncAwait('clustor.js'),
        await readFileUsingAsyncAwait('eventLoops.js'),
        await readFileUsingAsyncAwait('callBackHell.js'),
    ])
    console.log(data[0]);
    console.log(data[1]);
    console.log(data[2]);
}

readFileUsingPromiseAll()
