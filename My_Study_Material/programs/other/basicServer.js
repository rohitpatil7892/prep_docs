const http = require("http");

let server = http.createServer((req,res)=>{
    res.writeHead(200,{"Content-Type":"Application/json"})
    res.end(JSON.stringify({message:"Hello World"}))
})

server.listen(6000,()=>{
    console.log("Server is running on port: http://localhost:"+server.address().port);
    
})