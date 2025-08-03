const {exec, spawn, fork} = require("child_process")

let ls = spawn("ls",["-lh","/"]);

ls.stdout.on("data",(data)=>{
    console.log(`stdout: ${data}`);
});

ls.stderr.on("data",(data)=>{
    console.log(`stderr: ${data}`);
});

exec("ls -lh /",(err,stdout,stderr)=>{
    if(err){
        console.log(`error: ${err}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

fork("child_process.js",["-lh","/"]);