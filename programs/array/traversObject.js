let data = { a: 1, b: 2, c: 3, d: 4, d: 5 }

for (const [key, val] of Object.entries(data)) {
  console.log(key, val);
}
