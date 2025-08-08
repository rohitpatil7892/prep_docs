function identity(value: any): any {
  return value;
}

let a = identity("hello"); // a is 'any', lost type info 


function identity<T>(value: T): T {
  return value;
}

let a = identity("hello"); // a: string ✅
let b = identity(42);   