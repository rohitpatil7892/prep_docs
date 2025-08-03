# 🚀 Node.js Complete Interview Guide

## Table of Contents
1. [Node.js Fundamentals](#nodejs-fundamentals)
2. [Core Modules](#core-modules)
3. [Express.js Framework](#expressjs-framework)
4. [Advanced Concepts](#advanced-concepts)
5. [Interview Questions](#interview-questions)

---

## 🟢 Node.js Fundamentals

### 1. What is Node.js?

**Description:** Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.

**Key Features:**
- Single-threaded with event loop
- Non-blocking I/O operations
- NPM package ecosystem
- Cross-platform compatibility

**Example:**
```javascript
// Basic Node.js server
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Event Loop Deep Dive

**Description:** The Event Loop is the heart of Node.js's asynchronous behavior. It's a single-threaded loop that handles all JavaScript execution.

**Event Loop Phases:**
1. **Timer Phase** - Executes `setTimeout()` and `setInterval()` callbacks
2. **Pending Callbacks** - Executes I/O callbacks deferred to the next loop iteration
3. **Poll Phase** - Fetches new I/O events and executes their callbacks
4. **Check Phase** - Executes `setImmediate()` callbacks
5. **Close Callbacks** - Executes close event callbacks

**Detailed Example:**
```javascript
console.log('=== Start ===');

// Timer phase
setTimeout(() => console.log('Timer 1'), 0);
setTimeout(() => console.log('Timer 2'), 0);

// Check phase
setImmediate(() => console.log('Immediate 1'));
setImmediate(() => console.log('Immediate 2'));

// Next tick queue (highest priority)
process.nextTick(() => console.log('NextTick 1'));
process.nextTick(() => console.log('NextTick 2'));

// Promise microtask queue (high priority)
Promise.resolve().then(() => console.log('Promise 1'));
Promise.resolve().then(() => console.log('Promise 2'));

console.log('=== End ===');

/*
Output:
=== Start ===
=== End ===
NextTick 1
NextTick 2
Promise 1
Promise 2
Immediate 1
Immediate 2
Timer 1
Timer 2
*/
```

### 3. Asynchronous Programming Patterns

#### A. Callbacks
```javascript
const fs = require('fs');

// Callback pattern
function readFileCallback(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  });
}

// Usage
readFileCallback('example.txt', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('File content:', data);
  }
});
```

#### B. Promises
```javascript
const fs = require('fs').promises;

// Promise pattern
function readFilePromise(filename) {
  return fs.readFile(filename, 'utf8');
}

// Usage with .then()
readFilePromise('example.txt')
  .then(data => console.log('File content:', data))
  .catch(err => console.error('Error:', err.message));

// Chaining promises
readFilePromise('file1.txt')
  .then(data1 => {
    console.log('File 1:', data1);
    return readFilePromise('file2.txt');
  })
  .then(data2 => {
    console.log('File 2:', data2);
    return readFilePromise('file3.txt');
  })
  .then(data3 => {
    console.log('File 3:', data3);
  })
  .catch(err => console.error('Error in chain:', err.message));
```

#### C. Async/Await
```javascript
// Async/await pattern
async function readMultipleFiles() {
  try {
    // Sequential reading
    const data1 = await readFilePromise('file1.txt');
    const data2 = await readFilePromise('file2.txt');
    const data3 = await readFilePromise('file3.txt');
    
    console.log('All files read sequentially');
    return [data1, data2, data3];
  } catch (err) {
    console.error('Error reading files:', err.message);
    throw err;
  }
}

// Parallel reading with Promise.all
async function readFilesParallel() {
  try {
    const [data1, data2, data3] = await Promise.all([
      readFilePromise('file1.txt'),
      readFilePromise('file2.txt'),
      readFilePromise('file3.txt')
    ]);
    
    console.log('All files read in parallel');
    return [data1, data2, data3];
  } catch (err) {
    console.error('Error reading files in parallel:', err.message);
    throw err;
  }
}
```

### 4. Error Handling

#### Synchronous Error Handling
```javascript
// Try-catch for synchronous code
try {
  const data = JSON.parse('invalid json');
  console.log(data);
} catch (err) {
  console.error('Sync error:', err.message);
}
```

#### Asynchronous Error Handling
```javascript
// Callback error handling
function processData(data, callback) {
  setTimeout(() => {
    try {
      if (!data) {
        return callback(new Error('No data provided'));
      }
      const result = data.toUpperCase();
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  }, 100);
}

// Promise error handling
async function processDataAsync(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!data) {
          reject(new Error('No data provided'));
          return;
        }
        const result = data.toUpperCase();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
}

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

---

## 📦 Core Modules

### 1. File System (fs)

```javascript
const fs = require('fs');
const path = require('path');

// Synchronous operations
try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log('Sync read:', data);
} catch (err) {
  console.error('Sync error:', err.message);
}

// Asynchronous operations
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Async error:', err.message);
    return;
  }
  console.log('Async read:', data);
});

// Promise-based operations
const fsPromises = fs.promises;

async function fileOperations() {
  try {
    // Read file
    const content = await fsPromises.readFile('input.txt', 'utf8');
    
    // Process content
    const processed = content.toUpperCase();
    
    // Write to new file
    await fsPromises.writeFile('output.txt', processed);
    
    // Get file stats
    const stats = await fsPromises.stat('output.txt');
    console.log('File size:', stats.size, 'bytes');
    
    // Create directory
    await fsPromises.mkdir('new-directory', { recursive: true });
    
    // List directory contents
    const files = await fsPromises.readdir('.');
    console.log('Directory contents:', files);
    
  } catch (err) {
    console.error('File operation error:', err.message);
  }
}
```

### 2. HTTP Module

```javascript
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Route handling
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome to Node.js API' }));
    
  } else if (pathname === '/users' && req.method === 'GET') {
    const users = [
      { id: 1, name: 'Rohit', email: 'rohit@example.com' },
      { id: 2, name: 'John', email: 'john@example.com' }
    ];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
    
  } else if (pathname === '/users' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        console.log('Received user data:', userData);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          user: { id: Date.now(), ...userData }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### 3. Events Module

```javascript
const EventEmitter = require('events');

// Create custom event emitter
class UserService extends EventEmitter {
  constructor() {
    super();
    this.users = [];
  }
  
  createUser(userData) {
    const user = {
      id: Date.now(),
      ...userData,
      createdAt: new Date()
    };
    
    this.users.push(user);
    
    // Emit event
    this.emit('userCreated', user);
    this.emit('userActivity', { type: 'create', user });
    
    return user;
  }
  
  deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const deletedUser = this.users.splice(userIndex, 1)[0];
      this.emit('userDeleted', deletedUser);
      this.emit('userActivity', { type: 'delete', user: deletedUser });
      return deletedUser;
    }
    
    return null;
  }
}

// Usage
const userService = new UserService();

// Event listeners
userService.on('userCreated', (user) => {
  console.log('New user created:', user.name);
});

userService.on('userDeleted', (user) => {
  console.log('User deleted:', user.name);
});

userService.on('userActivity', (activity) => {
  console.log('User activity:', activity.type, activity.user.name);
});

// Error handling for events
userService.on('error', (err) => {
  console.error('UserService error:', err);
});

// Create and delete users
const user1 = userService.createUser({ name: 'Rohit', email: 'rohit@example.com' });
const user2 = userService.createUser({ name: 'John', email: 'john@example.com' });

userService.deleteUser(user1.id);
```

---

## 🌐 Express.js Framework

### 1. Basic Express Setup

```javascript
const express = require('express');
const app = express();

// Built-in middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Custom middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Verify token logic here
  req.user = { id: 1, name: 'Rohit' }; // Mock user
  next();
};

app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Express API',
    timestamp: new Date().toISOString()
  });
});

// Protected routes
app.use('/api/protected', authenticateToken);

app.get('/api/protected/profile', (req, res) => {
  res.json({ user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Advanced Express Features

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourapp.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request validation middleware
const validateUserInput = (req, res, next) => {
  const { name, email } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Name is required and must be at least 2 characters' 
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Valid email is required' 
    });
  }
  
  next();
};

// Routes with validation
app.post('/api/users', validateUserInput, (req, res) => {
  const { name, email } = req.body;
  const user = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase(),
    createdAt: new Date()
  };
  
  res.status(201).json({ success: true, user });
});
```

---

## 🔥 Advanced Concepts

### 1. Streams and Buffers

```javascript
const fs = require('fs');
const { Transform, Readable, Writable } = require('stream');
const crypto = require('crypto');

// Custom readable stream
class NumberStream extends Readable {
  constructor(options) {
    super(options);
    this.current = 0;
    this.max = 10;
  }
  
  _read() {
    if (this.current < this.max) {
      this.push(`Number: ${this.current}\n`);
      this.current++;
    } else {
      this.push(null); // End stream
    }
  }
}

// Custom transform stream
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// Custom writable stream
class LoggerStream extends Writable {
  _write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString().trim());
    callback();
  }
}

// Stream pipeline example
const numberStream = new NumberStream();
const upperCaseTransform = new UpperCaseTransform();
const loggerStream = new LoggerStream();

numberStream
  .pipe(upperCaseTransform)
  .pipe(loggerStream);

// File streaming with hash calculation
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => {
      hash.update(data);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', reject);
  });
}

// Buffer operations
const buffer1 = Buffer.alloc(10); // Zero-filled buffer
const buffer2 = Buffer.from('Hello Node.js', 'utf8');
const buffer3 = Buffer.from([72, 101, 108, 108, 111]); // ASCII values

console.log('Buffer 1:', buffer1);
console.log('Buffer 2:', buffer2.toString());
console.log('Buffer 3:', buffer3.toString());

// Buffer manipulation
const originalBuffer = Buffer.from('Hello World');
const slicedBuffer = originalBuffer.slice(0, 5);
const concatenatedBuffer = Buffer.concat([buffer2, buffer3]);

console.log('Original:', originalBuffer.toString());
console.log('Sliced:', slicedBuffer.toString());
console.log('Concatenated:', concatenatedBuffer.toString());
```

### 2. Cluster and Worker Threads

#### Cluster Module
```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Handle worker events
  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('Starting a new worker...');
    cluster.fork();
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Master received SIGTERM, shutting down gracefully');
    for (const id in cluster.workers) {
      cluster.workers[id].kill();
    }
  });
  
} else {
  // Worker process
  const server = http.createServer((req, res) => {
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 100) {
      // CPU intensive task
    }
    
    res.writeHead(200);
    res.end(`Worker ${process.pid} handled request\n`);
  });
  
  server.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
  
  // Graceful shutdown for worker
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM`);
    server.close(() => {
      process.exit(0);
    });
  });
}
```

#### Worker Threads
```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

if (isMainThread) {
  // Main thread
  console.log('Main thread started');
  
  const runWorker = (workerData) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };
  
  // Run multiple workers
  const runMultipleWorkers = async () => {
    const tasks = [
      { operation: 'fibonacci', number: 40 },
      { operation: 'fibonacci', number: 42 },
      { operation: 'prime', limit: 100000 },
      { operation: 'prime', limit: 200000 }
    ];
    
    try {
      const results = await Promise.all(
        tasks.map(task => runWorker(task))
      );
      
      console.log('All workers completed:', results);
    } catch (error) {
      console.error('Worker error:', error);
    }
  };
  
  runMultipleWorkers();
  
} else {
  // Worker thread
  const { operation, number, limit } = workerData;
  
  function fibonacci(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  function countPrimes(max) {
    const isPrime = new Array(max + 1).fill(true);
    isPrime[0] = isPrime[1] = false;
    
    for (let i = 2; i * i <= max; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= max; j += i) {
          isPrime[j] = false;
        }
      }
    }
    
    return isPrime.filter(Boolean).length;
  }
  
  let result;
  
  if (operation === 'fibonacci') {
    result = { 
      operation, 
      input: number, 
      result: fibonacci(number),
      worker: process.pid
    };
  } else if (operation === 'prime') {
    result = { 
      operation, 
      input: limit, 
      result: countPrimes(limit),
      worker: process.pid
    };
  }
  
  parentPort.postMessage(result);
}
```

---

## ❓ Interview Questions & Answers

### Basic Level

**Q1: What is Node.js and how does it differ from browser JavaScript?**

**A:** Node.js is a JavaScript runtime environment that allows you to run JavaScript on the server-side. Key differences:
- **Environment**: Browser has DOM/Window, Node.js has global/process
- **Modules**: Browser uses ES6 modules, Node.js traditionally uses CommonJS
- **APIs**: Browser has fetch/localStorage, Node.js has fs/http modules
- **Event Loop**: Similar concept but different implementation details

**Q2: Explain the difference between `require()` and `import`**

**A:** 
- `require()`: CommonJS syntax, synchronous, runtime loading, returns module.exports
- `import`: ES6 modules, supports tree-shaking, static analysis, asynchronous loading

```javascript
// CommonJS
const fs = require('fs');
const { readFile } = require('fs');

// ES6 Modules
import fs from 'fs';
import { readFile } from 'fs';
```

**Q3: What is the purpose of package.json and package-lock.json?**

**A:**
- **package.json**: Defines project metadata, dependencies, scripts, and configuration
- **package-lock.json**: Locks specific versions of dependencies and sub-dependencies for consistent installs across environments

**Q4: What is callback hell and how to avoid it?**

**A:** Callback hell occurs when multiple nested callbacks make code hard to read and maintain.

```javascript
// Callback hell
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      getEvenEvenMoreData(c, function(d) {
        // ... this goes on
      });
    });
  });
});

// Solutions:
// 1. Promises
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => getEvenEvenMoreData(c))
  .then(d => console.log(d));

// 2. Async/Await
async function processData() {
  const a = await getData();
  const b = await getMoreData(a);
  const c = await getEvenMoreData(b);
  const d = await getEvenEvenMoreData(c);
  console.log(d);
}
```

**Q5: What is the difference between process.nextTick() and setImmediate()?**

**A:**
- **process.nextTick()**: Executes before any other I/O events in the current phase
- **setImmediate()**: Executes in the check phase of the event loop

```javascript
console.log('start');

setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

console.log('end');

// Output: start, end, nextTick, setImmediate
```

### Intermediate Level

**Q6: Explain the Node.js Event Loop in detail**

**A:** The Event Loop has 6 phases:
1. **Timer Phase**: Executes setTimeout/setInterval callbacks
2. **Pending Callbacks**: Executes I/O callbacks deferred to next iteration
3. **Poll Phase**: Fetches new I/O events and executes callbacks
4. **Check Phase**: Executes setImmediate callbacks
5. **Close Callbacks**: Executes close event callbacks

Priority order: process.nextTick() > Promise callbacks > setImmediate() > setTimeout()

**Q7: How do you handle errors in Node.js?**

**A:** Multiple approaches:
- **Synchronous**: try-catch blocks
- **Callbacks**: Error-first callback pattern
- **Promises**: .catch() or try-catch with async/await
- **Global**: process.on('uncaughtException') and process.on('unhandledRejection')

**Q8: What is middleware in Express.js? Create a custom middleware.**

**A:** Middleware functions execute during the request-response cycle. They have access to req, res, and next.

```javascript
// Custom authentication middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Continue to next middleware/route
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Usage
app.get('/protected', authenticateUser, (req, res) => {
  res.json({ message: 'Protected route', user: req.user });
});
```

**Q9: Explain the difference between spawn, exec, and fork in child_process.**

**A:**
- **spawn**: Launches a new process with a given command
- **exec**: Executes a command in a shell and buffers output
- **fork**: Special case of spawn for Node.js scripts

```javascript
const { spawn, exec, fork } = require('child_process');

// spawn - streaming data
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// exec - buffered output
exec('ls -la', (error, stdout, stderr) => {
  if (error) console.error(`exec error: ${error}`);
  console.log(`stdout: ${stdout}`);
});

// fork - Node.js scripts
const child = fork('./worker.js');
child.send({ message: 'Hello child!' });
child.on('message', (msg) => {
  console.log('Message from child:', msg);
});
```

**Q10: How do you implement caching in Node.js?**

**A:** Multiple caching strategies:

```javascript
// 1. In-memory cache
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }
  
  set(key, value, ttl = 60000) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}

// 2. Redis cache
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

### Advanced Level

**Q11: Explain clustering in Node.js and when to use it**

**A:** Clustering allows you to create multiple worker processes to utilize multi-core systems. Use when:
- CPU-intensive operations
- Need to scale beyond single thread limitations
- Want process isolation for stability

**Q12: What are streams and when would you use them?**

**A:** Streams process data piece by piece rather than loading everything into memory. Types:
- **Readable**: Reading data (fs.createReadStream)
- **Writable**: Writing data (fs.createWriteStream)
- **Transform**: Modifying data (zlib.createGzip)
- **Duplex**: Both readable and writable

Use for: Large files, real-time data processing, memory efficiency

**Q13: How do you optimize Node.js application performance?**

**A:** Key strategies:
- Use clustering for CPU-intensive tasks
- Implement caching (Redis, memory cache)
- Optimize database queries and use connection pooling
- Use compression middleware
- Implement proper error handling
- Monitor memory usage and fix leaks
- Use asynchronous operations
- Profile with tools like clinic.js

**Q14: Implement a rate limiter in Node.js**

**A:** Rate limiting prevents abuse and ensures fair usage:

```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

// Express middleware
const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

const rateLimitMiddleware = (req, res, next) => {
  const identifier = req.ip;
  
  if (!rateLimiter.isAllowed(identifier)) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: 60
    });
  }
  
  next();
};
```

**Q15: How do you handle memory leaks in Node.js?**

**A:** Common causes and solutions:

```javascript
// 1. Global variables (avoid)
let globalArray = []; // This grows indefinitely

// 2. Event listeners not removed
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Bad - memory leak
function createHandler() {
  const data = new Array(1000000).fill('data');
  emitter.on('event', () => {
    console.log(data.length);
  });
}

// Good - remove listeners
function createHandlerGood() {
  const data = new Array(1000000).fill('data');
  const handler = () => console.log(data.length);
  
  emitter.on('event', handler);
  
  // Remove when done
  setTimeout(() => {
    emitter.removeListener('event', handler);
  }, 5000);
}

// 3. Closures holding references
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    // Even if largeData isn't used, it's still referenced
    console.log('closure called');
  };
}

// Better - explicitly clear references
function createClosureBetter() {
  let largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('closure called');
    largeData = null; // Clear reference when done
  };
}

// Memory monitoring
process.on('SIGUSR2', () => {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
});
```

**Q16: Implement a simple pub/sub system in Node.js**

**A:**

```javascript
const EventEmitter = require('events');

class PubSub extends EventEmitter {
  constructor() {
    super();
    this.subscribers = new Map();
  }
  
  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    
    this.subscribers.get(channel).add(callback);
    this.on(channel, callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(channel).delete(callback);
      this.removeListener(channel, callback);
    };
  }
  
  publish(channel, data) {
    this.emit(channel, data);
  }
  
  getSubscriberCount(channel) {
    return this.subscribers.get(channel)?.size || 0;
  }
  
  getChannels() {
    return Array.from(this.subscribers.keys());
  }
}

// Usage
const pubsub = new PubSub();

// Subscribe
const unsubscribe1 = pubsub.subscribe('user.created', (user) => {
  console.log('New user:', user.name);
});

const unsubscribe2 = pubsub.subscribe('user.created', (user) => {
  console.log('Send welcome email to:', user.email);
});

// Publish
pubsub.publish('user.created', {
  name: 'Rohit',
  email: 'rohit@example.com'
});

// Unsubscribe
unsubscribe1();
```

**Q17: How do you implement graceful shutdown in Node.js?**

**A:**

```javascript
class GracefulShutdown {
  constructor() {
    this.servers = [];
    this.connections = new Set();
    this.isShuttingDown = false;
  }
  
  addServer(server) {
    this.servers.push(server);
    
    // Track connections
    server.on('connection', (connection) => {
      this.connections.add(connection);
      connection.on('close', () => {
        this.connections.delete(connection);
      });
    });
  }
  
  async shutdown(signal) {
    if (this.isShuttingDown) return;
    
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    this.isShuttingDown = true;
    
    // Stop accepting new requests
    const serverClosingPromises = this.servers.map(server => {
      return new Promise((resolve) => {
        server.close(resolve);
      });
    });
    
    await Promise.all(serverClosingPromises);
    console.log('Stopped accepting new connections');
    
    // Close existing connections
    this.connections.forEach(connection => {
      connection.end();
    });
    
    // Wait for connections to close or force close after timeout
    const timeout = setTimeout(() => {
      console.log('Force closing remaining connections');
      this.connections.forEach(connection => {
        connection.destroy();
      });
    }, 10000);
    
    // Wait for all connections to close
    while (this.connections.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    clearTimeout(timeout);
    console.log('All connections closed');
    
    // Cleanup resources
    await this.cleanup();
    
    process.exit(0);
  }
  
  async cleanup() {
    // Close database connections, clear caches, etc.
    console.log('Cleaning up resources...');
    // await database.close();
    // await redis.quit();
  }
}

// Usage
const gracefulShutdown = new GracefulShutdown();

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

gracefulShutdown.addServer(server);

// Handle shutdown signals
['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach(signal => {
  process.on(signal, () => gracefulShutdown.shutdown(signal));
});
```

**Q18: Explain worker threads and when to use them**

**A:** Worker threads allow running JavaScript in parallel, useful for CPU-intensive tasks:

```javascript
// main.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const runWorker = (data) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };
  
  // CPU-intensive task
  const processLargeDataset = async () => {
    const chunks = [
      { start: 0, end: 1000000 },
      { start: 1000000, end: 2000000 },
      { start: 2000000, end: 3000000 },
      { start: 3000000, end: 4000000 }
    ];
    
    const results = await Promise.all(
      chunks.map(chunk => runWorker(chunk))
    );
    
    return results.reduce((sum, result) => sum + result, 0);
  };
  
  processLargeDataset().then(total => {
    console.log('Total processed:', total);
  });
  
} else {
  // Worker thread
  const { start, end } = workerData;
  
  // Simulate CPU-intensive work
  let result = 0;
  for (let i = start; i < end; i++) {
    result += Math.sqrt(i);
  }
  
  parentPort.postMessage(result);
}
```

This comprehensive guide covers all essential Node.js concepts with practical examples and detailed explanations perfect for interview preparation. 