# 🚀 Node.js Advanced Interview Questions & Answers

## Table of Contents
1. [Core Concepts & Event Loop](#core-concepts--event-loop)
2. [Asynchronous Programming](#asynchronous-programming)
3. [Modules & Package Management](#modules--package-management)
4. [Performance & Optimization](#performance--optimization)
5. [Security](#security)
6. [Advanced Architecture](#advanced-architecture)
7. [Testing & Debugging](#testing--debugging)
8. [Deployment & DevOps](#deployment--devops)

---

## 🔄 Core Concepts & Event Loop

### Q1: Explain the Node.js Event Loop phases and microtasks queue in detail

**A:** The Event Loop has 6 phases with microtasks processed between each phase:

**Phases:**
1. **Timer Phase** - setTimeout/setInterval callbacks
2. **Pending Callbacks** - I/O callbacks deferred to next loop iteration
3. **Poll Phase** - New I/O events; executes I/O callbacks
4. **Check Phase** - setImmediate callbacks
5. **Close Callbacks** - close event callbacks

**Microtasks Queue (Priority):**
- `process.nextTick()` (highest priority)
- `Promise.resolve().then()` 
- `queueMicrotask()`

```javascript
console.log('Start');

// Timer phase
setTimeout(() => console.log('Timer 1'), 0);
setTimeout(() => console.log('Timer 2'), 0);

// Check phase
setImmediate(() => console.log('Immediate 1'));
setImmediate(() => console.log('Immediate 2'));

// Microtasks
process.nextTick(() => {
    console.log('NextTick 1');
    process.nextTick(() => console.log('NextTick 2'));
});

Promise.resolve().then(() => {
    console.log('Promise 1');
    return Promise.resolve();
}).then(() => console.log('Promise 2'));

console.log('End');

/*
Output:
Start
End
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

### Q2: What is the difference between `setImmediate()` and `setTimeout(fn, 0)`?

**A:** The execution order depends on the context:

```javascript
// Inside I/O callback - setImmediate executes first
const fs = require('fs');

fs.readFile('file.txt', () => {
    setTimeout(() => console.log('setTimeout'), 0);
    setImmediate(() => console.log('setImmediate'));
    // Output: setImmediate, setTimeout
});

// Main thread - order is non-deterministic
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
// Output: varies (depends on system performance)
```

**Technical Explanation:**
- `setImmediate()` executes in the **Check phase**
- `setTimeout(fn, 0)` executes in the **Timer phase**
- Timer phase comes before Check phase in the event loop

### Q3: Explain Node.js clustering and how it handles load balancing

**A:** Node.js clustering allows creating child processes that share the same server port:

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
    
    // Handle worker death
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Restart worker
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Master received SIGTERM, shutting down gracefully');
        cluster.disconnect(() => {
            process.exit(0);
        });
    });
} else {
    // Worker process
    const server = http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`Hello from worker ${process.pid}\n`);
    });
    
    server.listen(8000);
    console.log(`Worker ${process.pid} started`);
}
```

**Load Balancing Strategies:**
- **Round Robin** (default on all platforms except Windows)
- **Least Recently Used** (Windows default)

---

## 🔄 Asynchronous Programming

### Q4: Compare callbacks, promises, and async/await with real-world examples

**A:** Evolution of asynchronous programming patterns:

#### Callbacks (Legacy)
```javascript
const fs = require('fs');

// Callback Hell
function processFiles(callback) {
    fs.readFile('file1.txt', 'utf8', (err, data1) => {
        if (err) return callback(err);
        
        fs.readFile('file2.txt', 'utf8', (err, data2) => {
            if (err) return callback(err);
            
            fs.writeFile('output.txt', data1 + data2, (err) => {
                if (err) return callback(err);
                callback(null, 'Files processed successfully');
            });
        });
    });
}
```

#### Promises
```javascript
const fs = require('fs').promises;

// Promise Chain
function processFilesPromise() {
    let data1, data2;
    
    return fs.readFile('file1.txt', 'utf8')
        .then(data => {
            data1 = data;
            return fs.readFile('file2.txt', 'utf8');
        })
        .then(data => {
            data2 = data;
            return fs.writeFile('output.txt', data1 + data2);
        })
        .then(() => 'Files processed successfully')
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
}
```

#### Async/Await (Modern)
```javascript
// Clean async/await
async function processFilesAsync() {
    try {
        const [data1, data2] = await Promise.all([
            fs.readFile('file1.txt', 'utf8'),
            fs.readFile('file2.txt', 'utf8')
        ]);
        
        await fs.writeFile('output.txt', data1 + data2);
        return 'Files processed successfully';
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}
```

### Q5: Explain Promise.all(), Promise.race(), Promise.allSettled() with use cases

**A:** Different promise combination strategies:

```javascript
// Promise.all() - All must succeed
async function fetchUserData(userId) {
    try {
        const [user, posts, friends] = await Promise.all([
            fetchUser(userId),
            fetchUserPosts(userId),
            fetchUserFriends(userId)
        ]);
        
        return { user, posts, friends };
    } catch (error) {
        // If any promise fails, entire operation fails
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
}

// Promise.race() - First to settle wins
async function fetchWithTimeout(url, timeout = 5000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
}

// Promise.allSettled() - All promises complete regardless of outcome
async function fetchMultipleAPIs(urls) {
    const results = await Promise.allSettled(
        urls.map(url => fetch(url).then(res => res.json()))
    );
    
    const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    
    const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
    
    return { successful, failed };
}
```

---

## 📦 Modules & Package Management

### Q6: Explain CommonJS vs ES6 modules and their interoperability

**A:** Node.js supports both module systems:

#### CommonJS (Traditional)
```javascript
// math.js
const PI = 3.14159;

function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

// Export
module.exports = { PI, add, multiply };
// OR
exports.PI = PI;
exports.add = add;
exports.multiply = multiply;

// Import
const { add, multiply } = require('./math');
const math = require('./math');
```

#### ES6 Modules (Modern)
```javascript
// math.mjs or math.js (with "type": "module" in package.json)
export const PI = 3.14159;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

// Default export
export default function subtract(a, b) {
    return a - b;
}

// Import
import { add, multiply } from './math.mjs';
import subtract, { PI } from './math.mjs';
import * as math from './math.mjs';
```

#### Interoperability
```javascript
// Using CommonJS in ES6 module
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const lodash = require('lodash');

// Using ES6 module in CommonJS
async function importESModule() {
    const { default: chalk } = await import('chalk');
    console.log(chalk.blue('Hello World'));
}
```

### Q7: How does Node.js module resolution work?

**A:** Node.js follows a specific algorithm for module resolution:

```javascript
// Module Resolution Algorithm
/*
1. Core modules (built-in) - highest priority
2. File modules - relative/absolute paths
3. Node modules - search in node_modules directories
*/

// Core modules
const fs = require('fs');          // Built-in module
const path = require('path');      // Built-in module

// File modules
const config = require('./config.js');        // Relative path
const utils = require('../utils/helpers.js'); // Relative path
const db = require('/absolute/path/to/db.js'); // Absolute path

// Node modules - searches in this order:
// ./node_modules/
// ../node_modules/
// ../../node_modules/
// ... up to root
const express = require('express');

// Module resolution with extensions
const data = require('./data');  // Tries: data.js, data.json, data.node
```

**Custom Module Loading:**
```javascript
// package.json
{
    "name": "my-app",
    "main": "index.js",
    "exports": {
        ".": "./index.js",
        "./utils": "./src/utils.js",
        "./config": "./src/config.js"
    }
}

// Usage
const app = require('my-app');           // Loads index.js
const utils = require('my-app/utils');   // Loads src/utils.js
const config = require('my-app/config'); // Loads src/config.js
```

---

## ⚡ Performance & Optimization

### Q8: How do you optimize Node.js applications for performance?

**A:** Multiple optimization strategies:

#### 1. Event Loop Optimization
```javascript
// Bad: Blocking event loop
function heavyComputation() {
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
        result += Math.random();
    }
    return result;
}

// Good: Non-blocking with setImmediate
function heavyComputationAsync(callback) {
    let result = 0;
    let i = 0;
    
    function compute() {
        const start = Date.now();
        while (i < 10000000 && Date.now() - start < 10) {
            result += Math.random();
            i++;
        }
        
        if (i < 10000000) {
            setImmediate(compute);
        } else {
            callback(result);
        }
    }
    
    compute();
}
```

#### 2. Memory Management
```javascript
// Memory leaks prevention
class DataProcessor {
    constructor() {
        this.cache = new Map();
        this.timers = new Set();
    }
    
    processData(data) {
        // Implement cache size limit
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(data.id, data);
    }
    
    cleanup() {
        // Clear all timers
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
        
        // Clear cache
        this.cache.clear();
    }
}
```

#### 3. Database Optimization
```javascript
// Connection pooling
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Batch operations
async function insertUsers(users) {
    const query = 'INSERT INTO users (name, email) VALUES ?';
    const values = users.map(user => [user.name, user.email]);
    
    await pool.execute(query, [values]);
}
```

#### 4. Caching Strategies
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache with TTL
async function getCachedData(key) {
    try {
        const cached = await client.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        
        const data = await fetchDataFromAPI(key);
        await client.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
        return data;
    } catch (error) {
        console.error('Cache error:', error);
        return await fetchDataFromAPI(key);
    }
}
```

### Q9: Explain Node.js profiling and monitoring techniques

**A:** Various profiling and monitoring approaches:

#### Built-in Profiling
```javascript
// CPU profiling
const { performance } = require('perf_hooks');

function profileFunction(fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`Function executed in ${end - start}ms`);
    return result;
}

// Memory usage monitoring
function getMemoryUsage() {
    const used = process.memoryUsage();
    const usage = {};
    
    for (let key in used) {
        usage[key] = Math.round(used[key] / 1024 / 1024 * 100) / 100 + ' MB';
    }
    
    return usage;
}

setInterval(() => {
    console.log('Memory usage:', getMemoryUsage());
}, 10000);
```

#### Advanced Profiling
```javascript
// Clinic.js integration
const clinic = require('@clinic/doctor');

clinic.collect(process.argv, (err, result) => {
    if (err) throw err;
    console.log('Profiling complete:', result);
});

// Custom metrics
class MetricsCollector {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: []
        };
    }
    
    recordRequest(startTime) {
        this.metrics.requests++;
        const duration = Date.now() - startTime;
        this.metrics.responseTime.push(duration);
    }
    
    recordError() {
        this.metrics.errors++;
    }
    
    getStats() {
        const responseTime = this.metrics.responseTime;
        const avgResponseTime = responseTime.reduce((a, b) => a + b, 0) / responseTime.length;
        
        return {
            totalRequests: this.metrics.requests,
            totalErrors: this.metrics.errors,
            errorRate: (this.metrics.errors / this.metrics.requests) * 100,
            avgResponseTime: avgResponseTime.toFixed(2)
        };
    }
}
```

---

## 🔒 Security

### Q10: What are common security vulnerabilities in Node.js and how to prevent them?

**A:** Major security concerns and prevention strategies:

#### 1. Injection Attacks
```javascript
// SQL Injection Prevention
const mysql = require('mysql2/promise');

// Bad: Vulnerable to SQL injection
function getUser(id) {
    const query = `SELECT * FROM users WHERE id = ${id}`;
    return db.execute(query);
}

// Good: Using parameterized queries
function getUserSecure(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    return db.execute(query, [id]);
}

// NoSQL Injection Prevention
const mongoose = require('mongoose');

// Bad: Vulnerable to NoSQL injection
function findUser(username) {
    return User.findOne({ username: username });
}

// Good: Input validation
function findUserSecure(username) {
    if (typeof username !== 'string') {
        throw new Error('Invalid username type');
    }
    return User.findOne({ username: username });
}
```

#### 2. Authentication & Authorization
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Secure password hashing
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

// JWT with secure practices
function generateToken(user) {
    return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { 
            expiresIn: '1h',
            issuer: 'your-app',
            audience: 'your-users'
        }
    );
}

// Middleware for authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}
```

#### 3. Input Validation & Sanitization
```javascript
const validator = require('validator');
const xss = require('xss');

// Input validation middleware
function validateInput(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: error.details[0].message 
            });
        }
        next();
    };
}

// XSS prevention
function sanitizeInput(req, res, next) {
    for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
}

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});
```

### Q11: How do you implement secure session management in Node.js?

**A:** Comprehensive session security implementation:

```javascript
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');

const app = express();

// Security headers
app.use(helmet());

// Secure session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId', // Don't use default session name
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: 'strict' // CSRF protection
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 24 hours
    })
}));

// Session validation middleware
function validateSession(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check session expiry
    if (req.session.lastActivity && 
        Date.now() - req.session.lastActivity > 30 * 60 * 1000) {
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired' });
    }
    
    req.session.lastActivity = Date.now();
    next();
}

// Login with session creation
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.lastActivity = Date.now();
        
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout with session destruction
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('sessionId');
        res.json({ message: 'Logged out successfully' });
    });
});
```

---

## 🏗️ Advanced Architecture

### Q12: Explain microservices architecture with Node.js

**A:** Microservices implementation patterns:

#### Service Communication
```javascript
// API Gateway
const express = require('express');
const httpProxy = require('http-proxy-middleware');

const app = express();

// Service registry
const services = {
    user: 'http://localhost:3001',
    order: 'http://localhost:3002',
    payment: 'http://localhost:3003'
};

// Proxy middleware
Object.keys(services).forEach(path => {
    app.use(`/${path}`, httpProxy({
        target: services[path],
        changeOrigin: true,
        pathRewrite: { [`^/${path}`]: '' }
    }));
});

// User Service
const userApp = express();

userApp.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Service-to-service communication
async function getOrderWithUser(orderId) {
    try {
        const order = await Order.findById(orderId);
        const userResponse = await fetch(`${services.user}/users/${order.userId}`);
        const user = await userResponse.json();
        
        return { ...order, user };
    } catch (error) {
        throw new Error(`Failed to get order with user: ${error.message}`);
    }
}
```

#### Event-Driven Architecture
```javascript
const EventEmitter = require('events');

class OrderService extends EventEmitter {
    async createOrder(orderData) {
        try {
            const order = await Order.create(orderData);
            
            // Emit event for other services
            this.emit('order.created', {
                orderId: order.id,
                userId: order.userId,
                amount: order.amount
            });
            
            return order;
        } catch (error) {
            this.emit('order.failed', { error: error.message });
            throw error;
        }
    }
}

// Message Queue Integration
const amqp = require('amqplib');

class MessageQueue {
    constructor() {
        this.connection = null;
        this.channel = null;
    }
    
    async connect() {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
    }
    
    async publish(queue, message) {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }
    
    async consume(queue, callback) {
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                callback(data);
                this.channel.ack(msg);
            }
        });
    }
}
```

### Q13: How do you implement graceful shutdown in Node.js applications?

**A:** Proper shutdown handling for production applications:

```javascript
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Track active connections
let connections = new Set();

server.on('connection', (connection) => {
    connections.add(connection);
    
    connection.on('close', () => {
        connections.delete(connection);
    });
});

// Graceful shutdown handler
function gracefulShutdown(signal) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
        console.log('HTTP server closed');
        
        // Close database connections
        mongoose.connection.close(() => {
            console.log('Database connection closed');
            
            // Close Redis connection
            redisClient.quit(() => {
                console.log('Redis connection closed');
                process.exit(0);
            });
        });
    });
    
    // Force close after timeout
    setTimeout(() => {
        console.log('Forcefully shutting down');
        connections.forEach(connection => connection.destroy());
        process.exit(1);
    }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
```

---

## 🧪 Testing & Debugging

### Q14: Explain different testing strategies for Node.js applications

**A:** Comprehensive testing approaches:

#### Unit Testing
```javascript
// math.js
function add(a, b) {
    return a + b;
}

function divide(a, b) {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
}

module.exports = { add, divide };

// math.test.js
const { add, divide } = require('./math');

describe('Math functions', () => {
    describe('add', () => {
        test('should add two positive numbers', () => {
            expect(add(2, 3)).toBe(5);
        });
        
        test('should handle negative numbers', () => {
            expect(add(-1, 1)).toBe(0);
        });
    });
    
    describe('divide', () => {
        test('should divide two numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });
        
        test('should throw error for division by zero', () => {
            expect(() => divide(10, 0)).toThrow('Division by zero');
        });
    });
});
```

#### Integration Testing
```javascript
// app.test.js
const request = require('supertest');
const app = require('./app');

describe('API Integration Tests', () => {
    beforeAll(async () => {
        await connectTestDatabase();
    });
    
    afterAll(async () => {
        await closeTestDatabase();
    });
    
    beforeEach(async () => {
        await clearTestData();
    });
    
    describe('POST /api/users', () => {
        test('should create a new user', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com'
            };
            
            const response = await request(app)
                .post('/api/users')
                .send(userData)
                .expect(201);
            
            expect(response.body.name).toBe(userData.name);
            expect(response.body.email).toBe(userData.email);
        });
        
        test('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ name: '' })
                .expect(400);
            
            expect(response.body.error).toBeDefined();
        });
    });
});
```

#### Mocking and Stubbing
```javascript
// userService.js
const database = require('./database');

async function getUser(id) {
    const user = await database.findUser(id);
    if (!user) throw new Error('User not found');
    return user;
}

module.exports = { getUser };

// userService.test.js
const { getUser } = require('./userService');
const database = require('./database');

// Mock the database module
jest.mock('./database');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('should return user when found', async () => {
        const mockUser = { id: 1, name: 'John' };
        database.findUser.mockResolvedValue(mockUser);
        
        const result = await getUser(1);
        
        expect(database.findUser).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockUser);
    });
    
    test('should throw error when user not found', async () => {
        database.findUser.mockResolvedValue(null);
        
        await expect(getUser(1)).rejects.toThrow('User not found');
    });
});
```

### Q15: How do you debug Node.js applications effectively?

**A:** Various debugging techniques and tools:

#### Built-in Debugging
```javascript
// Using console methods
console.log('Basic logging');
console.error('Error logging');
console.warn('Warning logging');
console.table([{ name: 'John', age: 30 }]);
console.time('operation');
// ... some operation
console.timeEnd('operation');

// Using debug module
const debug = require('debug')('app:server');

debug('Server starting on port %d', port);
debug('Database connected: %o', { host: 'localhost', port: 27017 });
```

#### Chrome DevTools Debugging
```javascript
// Start with --inspect flag
// node --inspect app.js

// Debug breakpoints
function processData(data) {
    debugger; // Breakpoint for Chrome DevTools
    
    const result = data.map(item => {
        return { 
            id: item.id, 
            processed: true,
            timestamp: Date.now()
        };
    });
    
    return result;
}
```

#### Production Debugging
```javascript
// Error tracking
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// APM Integration
const apm = require('elastic-apm-node').start({
    serviceName: 'my-app',
    serverUrl: 'http://localhost:8200'
});

// Performance monitoring
function monitorPerformance(fn) {
    return async (...args) => {
        const start = Date.now();
        const span = apm.startSpan('custom-operation');
        
        try {
            const result = await fn(...args);
            span.setTag('success', true);
            return result;
        } catch (error) {
            span.setTag('error', true);
            apm.captureError(error);
            throw error;
        } finally {
            span.end();
            const duration = Date.now() - start;
            logger.info(`Operation completed in ${duration}ms`);
        }
    };
}
```

---

## 🚀 Deployment & DevOps

### Q16: Explain containerization and deployment strategies for Node.js applications

**A:** Modern deployment approaches:

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "app.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/usr/src/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:6.2-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

#### Kubernetes Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs-app
  template:
    metadata:
      labels:
        app: nodejs-app
    spec:
      containers:
      - name: nodejs-app
        image: myregistry/nodejs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: nodejs-app-service
spec:
  selector:
    app: nodejs-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Q17: How do you implement CI/CD pipelines for Node.js applications?

**A:** Automated deployment pipeline:

#### GitHub Actions
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t myapp:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push myapp:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        # Deploy to Kubernetes, AWS, etc.
        kubectl set image deployment/nodejs-app nodejs-app=myapp:${{ github.sha }}
```

This comprehensive document covers intermediate to advanced Node.js interview questions with detailed explanations and practical examples. Each section builds upon core concepts and demonstrates real-world applications that senior developers would encounter in production environments. 