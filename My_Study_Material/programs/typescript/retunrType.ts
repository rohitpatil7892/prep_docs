// void, undefined, null, never—when to use?

// void: function returns nothing.
// undefined/null: actual values; use with strictNullChecks.
// never: function never returns (throws/loops) or a type that can’t exist.

function logMessage(msg: string): void {
  console.log(msg);
}

let v: void = undefined; // ✅ allowed

let u: undefined = undefined; // ✅
let val: number | undefined;  // number OR missing value

let n: null = null;
let maybeUser: string | null = null; // explicitly “no user”

type Shape = "circle" | "square";

function getArea(shape: Shape) {
  if (shape === "circle") return 3.14;
  if (shape === "square") return 4;

  const _exhaustiveCheck: never = shape; // ❌ compiler error if new case added
}