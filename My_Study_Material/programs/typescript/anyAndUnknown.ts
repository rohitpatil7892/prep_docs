let a: any = "hello";
a.toFixed(); // ❌ Runtime error (no compile-time warning)

let u: unknown = "hello";
u.toFixed(); // ❌ Compile-time error – must narrow first

if (typeof u === "string") {
  console.log(u.toUpperCase()); // ✅ Safe after narrowing
}