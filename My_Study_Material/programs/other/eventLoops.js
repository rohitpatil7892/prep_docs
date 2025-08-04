console.log("This is the first line"); // 1

setTimeout(()=>{console.log("inside the setTimeout");// 4 (after the promise)
})

setInterval(()=>{
    console.log("inside the setInterval"); // 5 last
    process.exit(0);
}, 1000);

process.nextTick(()=>{
    console.log("inside the nextTick"); // 2
});

Promise.resolve().then(()=>{
    console.log("inside the promise"); // 3
});

console.log("This is the last line"); // 1

