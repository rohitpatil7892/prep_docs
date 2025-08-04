const EventEmitter = require("events");

class counter extends EventEmitter{
    constructor(n){
        super();
        this.n = n;
    }
    increment(){
        this.n++;
        this.emit("count",this.n);
    }
}

const counter2 = new counter(10);
counter2.on("count",(n)=>{
    console.log(n);
})

counter2.increment();
counter2.increment();