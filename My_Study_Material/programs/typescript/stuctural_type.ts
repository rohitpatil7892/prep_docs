type point = { x: number, y: number }

// const p: point = { x: 1, y: 2, z: 3 } // Not allowed for extra params

const p1 = { x: 1, y: 2, z: 3 }
const r: point = p1

console.log(r);
