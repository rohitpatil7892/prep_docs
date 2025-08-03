# 🔴 Performance Optimization Complete Guide

## Table of Contents
1. [Node.js Performance](#nodejs-performance)
2. [Database Optimization](#database-optimization)
3. [Caching Strategies](#caching-strategies)
4. [Load Testing](#load-testing)
5. [Monitoring & Profiling](#monitoring--profiling)
6. [Interview Questions](#interview-questions)

---

## 🟢 Node.js Performance

### 1. Event Loop Optimization

**Understanding Blocking Operations:**
```javascript
// Bad - Blocking synchronous operations
const fs = require('fs');

function badFileRead() {
  console.log('Before file read');
  const data = fs.readFileSync('large-file.txt', 'utf8'); // Blocks event loop
  console.log('After file read');
  return data;
}

// Good - Non-blocking asynchronous operations
async function goodFileRead() {
  console.log('Before file read');
  const data = await fs.promises.readFile('large-file.txt', 'utf8');
  console.log('After file read');
  return data;
}

// Better - Using streams for large files
const { createReadStream } = require('fs');
const { Transform } = require('stream');

function streamFileRead() {
  return new Promise((resolve, reject) => {
    let data = '';
    const readStream = createReadStream('large-file.txt', { encoding: 'utf8' });
    
    readStream.on('data', chunk => {
      data += chunk;
    });
    
    readStream.on('end', () => {
      resolve(data);
    });
    
    readStream.on('error', reject);
  });
}
```

**CPU-Intensive Task Optimization:**
```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Worker thread for CPU-intensive tasks
if (isMainThread) {
  // Main thread
  async function calculateFibonacci(n) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { operation: 'fibonacci', number: n }
      });
      
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
  
  // Usage
  async function processRequests() {
    const results = await Promise.all([
      calculateFibonacci(40),
      calculateFibonacci(41),
      calculateFibonacci(42)
    ]);
    console.log('Results:', results);
  }
  
} else {
  // Worker thread
  function fibonacci(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  const { operation, number } = workerData;
  
  if (operation === 'fibonacci') {
    const result = fibonacci(number);
    parentPort.postMessage(result);
  }
}

// Cluster for scaling across multiple cores
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Worker process
  const express = require('express');
  const app = express();
  
  app.get('/heavy-task', async (req, res) => {
    // CPU-intensive task handled by worker
    const result = await calculateFibonacci(35);
    res.json({ result, worker: process.pid });
  });
  
  app.listen(3000);
}
```

### 2. Memory Management

**Memory Leak Detection:**
```javascript
// Memory monitoring
function monitorMemory() {
  const usage = process.memoryUsage();
  
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`,
    arrayBuffers: `${Math.round(usage.arrayBuffers / 1024 / 1024)} MB`
  });
}

setInterval(monitorMemory, 30000);

// Common memory leak patterns and fixes
class BadEventEmitter {
  constructor() {
    this.listeners = [];
    
    // Memory leak - listeners never removed
    setInterval(() => {
      this.listeners.push(() => console.log('Event'));
    }, 100);
  }
}

class GoodEventEmitter {
  constructor() {
    this.listeners = new Set();
    this.maxListeners = 100;
  }
  
  addListener(listener) {
    if (this.listeners.size >= this.maxListeners) {
      throw new Error('Max listeners exceeded');
    }
    this.listeners.add(listener);
  }
  
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  
  destroy() {
    this.listeners.clear();
  }
}

// Proper cleanup for timers and event listeners
class ResourceManager {
  constructor() {
    this.timers = new Set();
    this.eventListeners = new Map();
  }
  
  createTimer(callback, interval) {
    const timer = setInterval(callback, interval);
    this.timers.add(timer);
    return timer;
  }
  
  addEventListener(emitter, event, listener) {
    emitter.on(event, listener);
    
    if (!this.eventListeners.has(emitter)) {
      this.eventListeners.set(emitter, new Map());
    }
    
    const emitterListeners = this.eventListeners.get(emitter);
    if (!emitterListeners.has(event)) {
      emitterListeners.set(event, new Set());
    }
    
    emitterListeners.get(event).add(listener);
  }
  
  cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    
    // Remove all event listeners
    this.eventListeners.forEach((events, emitter) => {
      events.forEach((listeners, event) => {
        listeners.forEach(listener => {
          emitter.removeListener(event, listener);
        });
      });
    });
    this.eventListeners.clear();
  }
}
```

### 3. Async Optimization

**Promise Optimization:**
```javascript
// Sequential vs Parallel execution
async function sequentialExecution() {
  console.time('Sequential');
  
  const user = await fetchUser('123');
  const posts = await fetchPosts('123');
  const comments = await fetchComments('123');
  
  console.timeEnd('Sequential'); // ~300ms if each takes 100ms
  return { user, posts, comments };
}

async function parallelExecution() {
  console.time('Parallel');
  
  const [user, posts, comments] = await Promise.all([
    fetchUser('123'),
    fetchPosts('123'),
    fetchComments('123')
  ]);
  
  console.timeEnd('Parallel'); // ~100ms (max of individual times)
  return { user, posts, comments };
}

// Controlled concurrency for large datasets
const pLimit = require('p-limit');

async function processUsersWithLimit(userIds) {
  const limit = pLimit(5); // Max 5 concurrent operations
  
  const results = await Promise.all(
    userIds.map(id => 
      limit(() => processUser(id))
    )
  );
  
  return results;
}

// Promise pool for better resource management
class PromisePool {
  constructor(concurrency = 10) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(promiseFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseFunction,
        resolve,
        reject
      });
      
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { promiseFunction, resolve, reject } = this.queue.shift();
    
    try {
      const result = await promiseFunction();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item
    }
  }
}

// Usage
const pool = new PromisePool(5);

async function processAllUsers(userIds) {
  const promises = userIds.map(id => 
    pool.add(() => fetchUser(id))
  );
  
  return Promise.all(promises);
}
```

---

## 🗄️ Database Optimization

### 1. Connection Pooling

**PostgreSQL with node-postgres:**
```javascript
const { Pool } = require('pg');

// Optimized connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool configuration
  max: 20,              // Maximum connections
  min: 5,               // Minimum connections
  idle: 10000,          // Max idle time (10 seconds)
  connectionTimeoutMillis: 2000,  // Connection timeout
  idleTimeoutMillis: 30000,       // Idle timeout
  
  // Statement timeout
  statement_timeout: 30000,       // 30 seconds
  query_timeout: 30000,
  
  // Application name for monitoring
  application_name: 'myapp'
});

// Connection pool monitoring
pool.on('connect', (client) => {
  console.log('New client connected');
});

pool.on('error', (err, client) => {
  console.error('Pool error:', err);
});

// Graceful pool shutdown
process.on('SIGINT', async () => {
  console.log('Closing pool...');
  await pool.end();
  process.exit(0);
});

// Database service with optimized queries
class DatabaseService {
  constructor() {
    this.pool = pool;
  }
  
  // Use prepared statements for repeated queries
  async getUserById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }
  
  // Batch operations for better performance
  async createUsers(users) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertPromises = users.map(user => 
        client.query(
          'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
          [user.name, user.email]
        )
      );
      
      const results = await Promise.all(insertPromises);
      await client.query('COMMIT');
      
      return results.map(r => r.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Pagination with proper indexing
  async getUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const countQuery = 'SELECT COUNT(*) FROM users WHERE active = true';
    const dataQuery = `
      SELECT id, name, email, created_at 
      FROM users 
      WHERE active = true 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const [countResult, dataResult] = await Promise.all([
      this.pool.query(countQuery),
      this.pool.query(dataQuery, [limit, offset])
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
```

### 2. Query Optimization

**Index Optimization:**
```sql
-- Composite indexes for multi-column queries
CREATE INDEX idx_users_status_created ON users(status, created_at DESC);

-- Partial indexes for filtered queries
CREATE INDEX idx_active_users_email ON users(email) WHERE status = 'active';

-- Functional indexes for computed values
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Covering indexes to avoid table lookups
CREATE INDEX idx_posts_covering ON posts(user_id, created_at) INCLUDE (title, content);

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

**Query Performance Analysis:**
```sql
-- Enable query performance tracking
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Analyze slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Optimize specific query
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC
LIMIT 10;
```

### 3. MongoDB Optimization

**Aggregation Pipeline Optimization:**
```javascript
// Optimized aggregation pipeline
const getUserAnalytics = async () => {
  return User.aggregate([
    // Early filtering to reduce dataset
    {
      $match: {
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    
    // Use $lookup with pipeline for better performance
    {
      $lookup: {
        from: 'posts',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$authorId', '$$userId'] } } },
          { $project: { _id: 1, title: 1, createdAt: 1 } }
        ],
        as: 'posts'
      }
    },
    
    // Project early to reduce memory usage
    {
      $project: {
        name: 1,
        email: 1,
        postCount: { $size: '$posts' },
        latestPost: { $max: '$posts.createdAt' }
      }
    },
    
    // Filter after computation
    {
      $match: {
        postCount: { $gte: 5 }
      }
    },
    
    // Sort and limit
    { $sort: { postCount: -1 } },
    { $limit: 100 }
  ]);
};

// Index optimization for MongoDB
// Compound indexes
db.users.createIndex({ "isActive": 1, "createdAt": -1 });
db.posts.createIndex({ "authorId": 1, "createdAt": -1 });

// Text search index
db.users.createIndex({ "name": "text", "bio": "text" });

// Sparse index for optional fields
db.users.createIndex({ "profile.socialMedia.twitter": 1 }, { sparse: true });

// TTL index for temporary data
db.sessions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 });
```

---

## 🚀 Caching Strategies

### 1. Multi-Level Caching

**Application-Level Caching:**
```javascript
const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    // L1 Cache - In-memory (fast, small)
    this.l1Cache = new NodeCache({
      stdTTL: 300,      // 5 minutes
      maxKeys: 1000,    // Max 1000 keys
      checkperiod: 120  // Check expired keys every 2 minutes
    });
    
    // L2 Cache - Redis (medium speed, larger)
    this.l2Cache = require('ioredis').createClient(process.env.REDIS_URL);
    
    // L3 Cache - Database query cache
    this.queryCache = new Map();
  }
  
  async get(key) {
    // Try L1 cache first
    let value = this.l1Cache.get(key);
    if (value !== undefined) {
      return value;
    }
    
    // Try L2 cache
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      value = JSON.parse(l2Value);
      // Populate L1 cache
      this.l1Cache.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 300) {
    // Set in both caches
    this.l1Cache.set(key, value, ttl);
    await this.l2Cache.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(key) {
    this.l1Cache.del(key);
    await this.l2Cache.del(key);
  }
  
  // Cache patterns
  async cacheAside(key, fetchFunction, ttl = 300) {
    let value = await this.get(key);
    
    if (value === null) {
      value = await fetchFunction();
      if (value !== null) {
        await this.set(key, value, ttl);
      }
    }
    
    return value;
  }
  
  async writeThrough(key, value, persistFunction) {
    // Write to cache and database simultaneously
    await Promise.all([
      this.set(key, value),
      persistFunction(value)
    ]);
  }
  
  async writeBehind(key, value, persistFunction) {
    // Write to cache immediately, database asynchronously
    await this.set(key, value);
    
    // Queue for background persistence
    setImmediate(async () => {
      try {
        await persistFunction(value);
      } catch (error) {
        console.error('Write-behind persistence failed:', error);
        // Could implement retry logic here
      }
    });
  }
}

// Usage in service layer
class UserService {
  constructor() {
    this.cache = new CacheManager();
    this.userRepository = new UserRepository();
  }
  
  async getUser(id) {
    const cacheKey = `user:${id}`;
    
    return this.cache.cacheAside(
      cacheKey,
      () => this.userRepository.findById(id),
      3600 // 1 hour TTL
    );
  }
  
  async updateUser(id, updates) {
    const user = await this.userRepository.update(id, updates);
    
    // Write-through caching
    const cacheKey = `user:${id}`;
    await this.cache.writeThrough(
      cacheKey,
      user,
      () => Promise.resolve() // Already persisted
    );
    
    // Invalidate related caches
    await this.cache.invalidate(`users:list:*`);
    
    return user;
  }
}
```

### 2. Cache Invalidation Strategies

**Smart Cache Invalidation:**
```javascript
class SmartCache {
  constructor() {
    this.cache = new Map();
    this.dependencies = new Map(); // key -> Set of dependent keys
    this.subscribers = new Map();  // pattern -> Set of callbacks
  }
  
  set(key, value, dependencies = []) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      dependencies
    });
    
    // Track reverse dependencies
    dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep).add(key);
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    return cached ? cached.value : null;
  }
  
  invalidate(key) {
    // Invalidate the key itself
    this.cache.delete(key);
    
    // Invalidate dependent keys
    const dependents = this.dependencies.get(key);
    if (dependents) {
      dependents.forEach(dependent => {
        this.invalidate(dependent);
      });
      this.dependencies.delete(key);
    }
    
    // Notify subscribers
    this.notifySubscribers(key);
  }
  
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }
  
  subscribe(pattern, callback) {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern).add(callback);
  }
  
  notifySubscribers(key) {
    this.subscribers.forEach((callbacks, pattern) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(key)) {
        callbacks.forEach(callback => callback(key));
      }
    });
  }
}

// Usage with tag-based invalidation
class ProductService {
  constructor() {
    this.cache = new SmartCache();
  }
  
  async getProduct(id) {
    const cacheKey = `product:${id}`;
    let product = this.cache.get(cacheKey);
    
    if (!product) {
      product = await this.productRepository.findById(id);
      // Cache with dependencies
      this.cache.set(cacheKey, product, [
        'products',
        `category:${product.categoryId}`,
        `brand:${product.brandId}`
      ]);
    }
    
    return product;
  }
  
  async updateProduct(id, updates) {
    const product = await this.productRepository.update(id, updates);
    
    // Invalidate specific product and related caches
    this.cache.invalidate(`product:${id}`);
    
    // If category changed, invalidate old category cache
    if (updates.categoryId) {
      this.cache.invalidatePattern(`category:*`);
    }
    
    return product;
  }
}
```

---

## 🔍 Load Testing

### 1. Artillery.js Load Testing

**Basic Load Test Configuration:**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"
  payload:
    path: "./users.csv"
    fields:
      - "id"
      - "name"
      - "email"

scenarios:
  - name: "User workflow"
    weight: 70
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ email }}"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
      
      - get:
          url: "/api/users/{{ id }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
      
      - get:
          url: "/api/posts"
          headers:
            Authorization: "Bearer {{ authToken }}"
          qs:
            page: "{{ $randomInt(1, 10) }}"
            limit: 20
      
      - think: 2
      
      - post:
          url: "/api/posts"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Test Post {{ $randomString() }}"
            content: "This is a test post content"

  - name: "Anonymous browsing"
    weight: 30
    flow:
      - get:
          url: "/api/posts/public"
          expect:
            - statusCode: 200
      
      - get:
          url: "/api/posts/{{ $randomInt(1, 1000) }}"
          expect:
            - statusCode: [200, 404]
```

**Custom Load Testing with Node.js:**
```javascript
const autocannon = require('autocannon');
const http = require('http');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.scenarios = new Map();
  }
  
  addScenario(name, scenario) {
    this.scenarios.set(name, scenario);
  }
  
  async runScenario(name, options = {}) {
    const scenario = this.scenarios.get(name);
    if (!scenario) {
      throw new Error(`Scenario ${name} not found`);
    }
    
    const testOptions = {
      url: this.baseUrl,
      connections: options.connections || 10,
      duration: options.duration || 30,
      ...scenario.options
    };
    
    if (scenario.setup) {
      await scenario.setup();
    }
    
    console.log(`Running scenario: ${name}`);
    const result = await autocannon(testOptions);
    
    if (scenario.teardown) {
      await scenario.teardown();
    }
    
    return this.analyzeResults(result);
  }
  
  analyzeResults(result) {
    const analysis = {
      summary: {
        duration: result.duration,
        connections: result.connections,
        throughput: result.throughput,
        latency: result.latency
      },
      performance: {
        avgThroughput: result.throughput.average,
        p95Latency: result.latency.p95,
        p99Latency: result.latency.p99,
        errorRate: (result.errors / result.requests.total) * 100
      },
      status: this.getPerformanceStatus(result)
    };
    
    return analysis;
  }
  
  getPerformanceStatus(result) {
    const errorRate = (result.errors / result.requests.total) * 100;
    const p95Latency = result.latency.p95;
    
    if (errorRate > 5) {
      return 'CRITICAL - High error rate';
    } else if (p95Latency > 1000) {
      return 'WARNING - High latency';
    } else if (result.throughput.average < 100) {
      return 'WARNING - Low throughput';
    } else {
      return 'GOOD - Performance within acceptable limits';
    }
  }
  
  async runComparisonTest(scenarios, options = {}) {
    const results = new Map();
    
    for (const [name, scenario] of scenarios) {
      console.log(`\nRunning ${name}...`);
      const result = await this.runScenario(name, options);
      results.set(name, result);
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    return this.compareResults(results);
  }
  
  compareResults(results) {
    const comparison = {
      best: { throughput: null, latency: null },
      worst: { throughput: null, latency: null }
    };
    
    let bestThroughput = 0;
    let bestLatency = Infinity;
    let worstThroughput = Infinity;
    let worstLatency = 0;
    
    for (const [name, result] of results) {
      const throughput = result.performance.avgThroughput;
      const latency = result.performance.p95Latency;
      
      if (throughput > bestThroughput) {
        bestThroughput = throughput;
        comparison.best.throughput = { name, value: throughput };
      }
      
      if (latency < bestLatency) {
        bestLatency = latency;
        comparison.best.latency = { name, value: latency };
      }
      
      if (throughput < worstThroughput) {
        worstThroughput = throughput;
        comparison.worst.throughput = { name, value: throughput };
      }
      
      if (latency > worstLatency) {
        worstLatency = latency;
        comparison.worst.latency = { name, value: latency };
      }
    }
    
    return comparison;
  }
}

// Usage
const tester = new LoadTester({ baseUrl: 'http://localhost:3000' });

// Define scenarios
tester.addScenario('baseline', {
  options: {
    method: 'GET',
    path: '/api/health'
  }
});

tester.addScenario('api-stress', {
  options: {
    method: 'GET',
    path: '/api/users',
    connections: 50,
    duration: 60
  }
});

// Run tests
async function runTests() {
  const baselineResult = await tester.runScenario('baseline');
  console.log('Baseline:', baselineResult);
  
  const stressResult = await tester.runScenario('api-stress');
  console.log('Stress test:', stressResult);
}
```

---

## 📊 Monitoring & Profiling

### 1. Application Performance Monitoring

**Custom Metrics Collection:**
```javascript
const prometheus = require('prom-client');

class MetricsCollector {
  constructor() {
    // Create default metrics
    this.register = new prometheus.Registry();
    
    // HTTP request metrics
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });
    
    this.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });
    
    // Database metrics
    this.dbQueryDuration = new prometheus.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries',
      labelNames: ['query_type', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
    });
    
    this.dbConnectionsActive = new prometheus.Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections'
    });
    
    // Memory metrics
    this.memoryUsage = new prometheus.Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Memory usage by type',
      labelNames: ['type']
    });
    
    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestsTotal);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.dbConnectionsActive);
    this.register.registerMetric(this.memoryUsage);
    
    // Collect default metrics
    prometheus.collectDefaultMetrics({ register: this.register });
    
    // Start memory monitoring
    this.startMemoryMonitoring();
  }
  
  // Express middleware for HTTP metrics
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        this.httpRequestDuration
          .labels(req.method, route, res.statusCode)
          .observe(duration);
        
        this.httpRequestsTotal
          .labels(req.method, route, res.statusCode)
          .inc();
      });
      
      next();
    };
  }
  
  // Database query timing
  wrapDatabaseQuery(queryFunction, queryType, table) {
    return async (...args) => {
      const start = Date.now();
      
      try {
        const result = await queryFunction.apply(this, args);
        
        const duration = (Date.now() - start) / 1000;
        this.dbQueryDuration
          .labels(queryType, table)
          .observe(duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - start) / 1000;
        this.dbQueryDuration
          .labels(`${queryType}_error`, table)
          .observe(duration);
        
        throw error;
      }
    };
  }
  
  startMemoryMonitoring() {
    setInterval(() => {
      const usage = process.memoryUsage();
      
      this.memoryUsage.labels('rss').set(usage.rss);
      this.memoryUsage.labels('heapTotal').set(usage.heapTotal);
      this.memoryUsage.labels('heapUsed').set(usage.heapUsed);
      this.memoryUsage.labels('external').set(usage.external);
    }, 10000); // Every 10 seconds
  }
  
  updateDatabaseConnections(count) {
    this.dbConnectionsActive.set(count);
  }
  
  getMetrics() {
    return this.register.metrics();
  }
}

// Usage in Express app
const express = require('express');
const app = express();
const metrics = new MetricsCollector();

// Add metrics middleware
app.use(metrics.middleware());

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await metrics.getMetrics());
});

// Health check with metrics
app.get('/health', (req, res) => {
  const usage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});
```

---

## ❓ Interview Questions & Answers

### Node.js Performance

**Q1: How do you identify performance bottlenecks in Node.js?**
**A:** 
- **Profiling tools**: Use clinic.js, 0x, or Node.js built-in profiler
- **Memory monitoring**: Track heap usage and garbage collection
- **Event loop monitoring**: Check for blocking operations
- **Database profiling**: Analyze slow queries and connection pools
- **Load testing**: Use tools like Artillery or autocannon

**Q2: Explain the difference between cluster and worker threads**
**A:**
- **Cluster**: Creates separate processes, shares server ports, good for I/O-intensive tasks
- **Worker threads**: Creates threads within same process, shares memory, good for CPU-intensive tasks

### Database Performance

**Q3: How do you optimize database queries?**
**A:**
- **Indexing**: Create appropriate indexes for query patterns
- **Query analysis**: Use EXPLAIN to understand execution plans
- **Connection pooling**: Reuse database connections
- **Batch operations**: Group multiple operations together
- **Pagination**: Use LIMIT/OFFSET or cursor-based pagination

**Q4: What are the different types of database caching?**
**A:**
- **Query result caching**: Cache query results
- **Object caching**: Cache application objects
- **Page caching**: Cache entire response pages
- **Database buffer pool**: Database-level caching

### System Performance

**Q5: How would you scale a Node.js application?**
**A:**
- **Vertical scaling**: Increase server resources
- **Horizontal scaling**: Add more servers with load balancer
- **Microservices**: Split into smaller, independent services
- **Caching**: Implement multi-level caching
- **CDN**: Use content delivery networks for static assets

**Q6: What metrics would you monitor in production?**
**A:**
- **Response time**: 95th and 99th percentile latency
- **Throughput**: Requests per second
- **Error rate**: Percentage of failed requests
- **Resource utilization**: CPU, memory, disk usage
- **Database performance**: Query time, connection pool usage

This comprehensive performance guide covers essential optimization techniques with practical examples for building high-performance Node.js applications. 