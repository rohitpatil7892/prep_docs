# 🟨 Database Complete Interview Guide

## Table of Contents
1. [SQL Fundamentals](#sql-fundamentals)
2. [Advanced SQL](#advanced-sql)
3. [Database Design](#database-design)
4. [NoSQL Databases](#nosql-databases)
5. [Database Performance](#database-performance)
6. [Interview Questions](#interview-questions)

---

## 🟢 SQL Fundamentals

### 1. CRUD Operations

**Basic Operations:**
```sql
-- CREATE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER CHECK (age >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT
INSERT INTO users (name, email, age) 
VALUES ('Rohit', 'rohit@example.com', 25);

INSERT INTO users (name, email, age) VALUES 
    ('John', 'john@example.com', 30),
    ('Jane', 'jane@example.com', 28),
    ('Bob', 'bob@example.com', 35);

-- SELECT
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 25;
SELECT COUNT(*) as total_users FROM users;

-- UPDATE
UPDATE users 
SET age = 26, updated_at = CURRENT_TIMESTAMP 
WHERE email = 'rohit@example.com';

-- DELETE
DELETE FROM users WHERE age < 18;
```

### 2. Joins and Relationships

**Table Setup:**
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (post_id, tag_id)
);
```

**Join Examples:**
```sql
-- INNER JOIN - Get users with their posts
SELECT u.name, u.email, p.title, p.created_at
FROM users u
INNER JOIN posts p ON u.id = p.user_id
ORDER BY p.created_at DESC;

-- LEFT JOIN - Get all users, including those without posts
SELECT u.name, u.email, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email
ORDER BY post_count DESC;

-- RIGHT JOIN - Get all posts, including those without valid users
SELECT p.title, u.name as author
FROM users u
RIGHT JOIN posts p ON u.id = p.user_id;

-- FULL OUTER JOIN - Get all users and posts
SELECT u.name, p.title
FROM users u
FULL OUTER JOIN posts p ON u.id = p.user_id;

-- Multiple JOINs - Posts with authors and comment counts
SELECT 
    p.title,
    u.name as author,
    COUNT(c.id) as comment_count,
    p.created_at
FROM posts p
INNER JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title, u.name, p.created_at
ORDER BY comment_count DESC;
```

### 3. Subqueries and CTEs

**Subqueries:**
```sql
-- Find users who have posted more than 5 posts
SELECT name, email
FROM users
WHERE id IN (
    SELECT user_id
    FROM posts
    GROUP BY user_id
    HAVING COUNT(*) > 5
);

-- Find the latest post for each user
SELECT u.name, p.title, p.created_at
FROM users u
INNER JOIN posts p ON u.id = p.user_id
WHERE p.created_at = (
    SELECT MAX(created_at)
    FROM posts p2
    WHERE p2.user_id = u.id
);

-- Correlated subquery - Users with above average post count
SELECT name, email,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
FROM users u
WHERE (
    SELECT COUNT(*)
    FROM posts
    WHERE user_id = u.id
) > (
    SELECT AVG(post_count)
    FROM (
        SELECT COUNT(*) as post_count
        FROM posts
        GROUP BY user_id
    ) as avg_counts
);
```

**Common Table Expressions (CTEs):**
```sql
-- Simple CTE
WITH user_stats AS (
    SELECT 
        u.id,
        u.name,
        COUNT(p.id) as post_count,
        COUNT(c.id) as comment_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    GROUP BY u.id, u.name
)
SELECT name, post_count, comment_count,
       (post_count + comment_count) as total_activity
FROM user_stats
ORDER BY total_activity DESC;

-- Recursive CTE - Organizational hierarchy
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: top-level managers
    SELECT id, name, manager_id, 0 as level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT id, name, level,
       REPEAT('  ', level) || name as indented_name
FROM employee_hierarchy
ORDER BY level, name;
```

---

## 🔥 Advanced SQL

### 1. Window Functions

```sql
-- ROW_NUMBER, RANK, DENSE_RANK
SELECT 
    name,
    age,
    ROW_NUMBER() OVER (ORDER BY age DESC) as row_num,
    RANK() OVER (ORDER BY age DESC) as rank,
    DENSE_RANK() OVER (ORDER BY age DESC) as dense_rank
FROM users;

-- PARTITION BY
SELECT 
    p.title,
    u.name as author,
    p.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY u.id 
        ORDER BY p.created_at DESC
    ) as post_rank_for_user
FROM posts p
INNER JOIN users u ON p.user_id = u.id;

-- LAG and LEAD functions
SELECT 
    title,
    created_at,
    LAG(created_at) OVER (ORDER BY created_at) as prev_post_date,
    LEAD(created_at) OVER (ORDER BY created_at) as next_post_date,
    created_at - LAG(created_at) OVER (ORDER BY created_at) as days_since_prev
FROM posts
ORDER BY created_at;

-- Running totals and moving averages
SELECT 
    created_at::date as post_date,
    COUNT(*) as daily_posts,
    SUM(COUNT(*)) OVER (
        ORDER BY created_at::date
        ROWS UNBOUNDED PRECEDING
    ) as running_total,
    AVG(COUNT(*)) OVER (
        ORDER BY created_at::date
        ROWS 6 PRECEDING
    ) as seven_day_avg
FROM posts
GROUP BY created_at::date
ORDER BY post_date;
```

### 2. Advanced Aggregations

```sql
-- GROUPING SETS
SELECT 
    EXTRACT(YEAR FROM created_at) as year,
    EXTRACT(MONTH FROM created_at) as month,
    COUNT(*) as post_count
FROM posts
GROUP BY GROUPING SETS (
    (EXTRACT(YEAR FROM created_at)),
    (EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)),
    ()
);

-- CUBE and ROLLUP
SELECT 
    u.name,
    EXTRACT(YEAR FROM p.created_at) as year,
    COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY CUBE (u.name, EXTRACT(YEAR FROM p.created_at));

-- Array aggregation
SELECT 
    u.name,
    ARRAY_AGG(p.title ORDER BY p.created_at) as post_titles,
    STRING_AGG(p.title, ', ' ORDER BY p.created_at) as titles_concat
FROM users u
INNER JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name;

-- Conditional aggregation
SELECT 
    name,
    COUNT(CASE WHEN age < 30 THEN 1 END) as young_users,
    COUNT(CASE WHEN age >= 30 AND age < 50 THEN 1 END) as middle_age_users,
    COUNT(CASE WHEN age >= 50 THEN 1 END) as senior_users
FROM users
GROUP BY name;
```

### 3. Performance Optimization

**Indexing:**
```sql
-- B-tree indexes (default)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Composite indexes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);

-- Partial indexes
CREATE INDEX idx_active_users ON users(name) WHERE active = true;

-- Functional indexes
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Index usage analysis
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM posts WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10;
```

**Query Optimization:**
```sql
-- Use LIMIT for pagination
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 20;

-- Better pagination with cursor-based approach
SELECT * FROM posts 
WHERE created_at < '2023-01-01 12:00:00'
ORDER BY created_at DESC 
LIMIT 10;

-- Use EXISTS instead of IN for large datasets
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM posts p 
    WHERE p.user_id = u.id 
    AND p.created_at > CURRENT_DATE - INTERVAL '30 days'
);

-- Avoid SELECT * in production
SELECT id, title, created_at FROM posts WHERE user_id = 123;
```

---

## 🏗️ Database Design

### 1. Normalization

**First Normal Form (1NF):**
```sql
-- Violates 1NF - Multiple values in single column
CREATE TABLE users_bad (
    id INTEGER,
    name VARCHAR(100),
    hobbies VARCHAR(500) -- 'reading,coding,gaming'
);

-- Follows 1NF - Atomic values
CREATE TABLE users_good (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user_hobbies (
    user_id INTEGER REFERENCES users_good(id),
    hobby VARCHAR(100),
    PRIMARY KEY (user_id, hobby)
);
```

**Second Normal Form (2NF):**
```sql
-- Violates 2NF - Partial dependency
CREATE TABLE order_items_bad (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    product_name VARCHAR(100), -- Depends only on product_id
    product_price DECIMAL(10,2), -- Depends only on product_id
    PRIMARY KEY (order_id, product_id)
);

-- Follows 2NF - Remove partial dependencies
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    order_date TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price DECIMAL(10,2), -- Price at time of order
    PRIMARY KEY (order_id, product_id)
);
```

**Third Normal Form (3NF):**
```sql
-- Violates 3NF - Transitive dependency
CREATE TABLE employees_bad (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER,
    department_name VARCHAR(100), -- Depends on department_id
    department_head VARCHAR(100)  -- Depends on department_id
);

-- Follows 3NF - Remove transitive dependencies
CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    head VARCHAR(100)
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER REFERENCES departments(id)
);
```

### 2. Entity-Relationship Design

```sql
-- E-commerce database design
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    type VARCHAR(20) CHECK (type IN ('billing', 'shipping')),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'USA'
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    description TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id INTEGER REFERENCES categories(id),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2),
    shipping_address_id INTEGER REFERENCES addresses(id),
    billing_address_id INTEGER REFERENCES addresses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```

---

## 📊 NoSQL Databases

### 1. MongoDB with Mongoose

**Schema Design:**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

// User schema
interface IUser extends Document {
  name: string;
  email: string;
  profile: {
    bio?: string;
    avatar?: string;
    social: {
      twitter?: string;
      linkedin?: string;
    };
  };
  posts: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: String,
    social: {
      twitter: String,
      linkedin: String
    }
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', 'profile.bio': 'text' });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
```

**Advanced Queries:**
```typescript
// Aggregation pipelines
const getUsersWithStats = async () => {
  return User.aggregate([
    // Match active users
    { $match: { isActive: true } },
    
    // Lookup posts
    {
      $lookup: {
        from: 'posts',
        localField: '_id',
        foreignField: 'author',
        as: 'userPosts'
      }
    },
    
    // Add computed fields
    {
      $addFields: {
        postCount: { $size: '$userPosts' },
        followerCount: { $size: '$followers' },
        followingCount: { $size: '$following' },
        engagementRatio: {
          $cond: {
            if: { $gt: [{ $size: '$following' }, 0] },
            then: {
              $divide: [
                { $size: '$followers' },
                { $size: '$following' }
              ]
            },
            else: 0
          }
        }
      }
    },
    
    // Group by post count ranges
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ['$postCount', 5] }, then: 'low' },
              { case: { $lte: ['$postCount', 20] }, then: 'medium' },
              { case: { $gt: ['$postCount', 20] }, then: 'high' }
            ],
            default: 'none'
          }
        },
        users: { $push: '$$ROOT' },
        averageEngagement: { $avg: '$engagementRatio' },
        totalUsers: { $sum: 1 }
      }
    },
    
    // Sort by engagement
    { $sort: { averageEngagement: -1 } }
  ]);
};

// Complex text search with scoring
const searchUsers = async (query: string) => {
  return User.aggregate([
    {
      $match: {
        $text: {
          $search: query,
          $caseSensitive: false
        }
      }
    },
    {
      $addFields: {
        score: { $meta: 'textScore' }
      }
    },
    {
      $sort: { score: -1 }
    },
    {
      $limit: 20
    }
  ]);
};
```

### 2. Redis Patterns

**Caching Patterns:**
```typescript
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  // Cache-aside pattern
  async getUser(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;
    
    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const user = await this.userRepository.findById(userId);
    if (user) {
      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
    }
    
    return user;
  }
  
  // Write-through pattern
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.userRepository.update(userId, updates);
    
    // Update cache
    const cacheKey = `user:${userId}`;
    await this.redis.setex(cacheKey, 3600, JSON.stringify(user));
    
    return user;
  }
  
  // Pub/Sub for real-time updates
  async subscribeToUserUpdates(callback: (user: User) => void): Promise<void> {
    const subscriber = this.redis.duplicate();
    
    subscriber.subscribe('user:updates');
    subscriber.on('message', (channel, message) => {
      if (channel === 'user:updates') {
        const user = JSON.parse(message);
        callback(user);
      }
    });
  }
  
  async publishUserUpdate(user: User): Promise<void> {
    await this.redis.publish('user:updates', JSON.stringify(user));
  }
  
  // Distributed locks
  async acquireLock(key: string, ttl: number = 10000): Promise<string | null> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}_${Math.random()}`;
    
    const result = await this.redis.set(
      lockKey,
      lockValue,
      'PX',
      ttl,
      'NX'
    );
    
    return result === 'OK' ? lockValue : null;
  }
  
  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }
}
```

---

## ⚡ Database Performance

### 1. Query Optimization

**Execution Plan Analysis:**
```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name
HAVING COUNT(p.id) > 5
ORDER BY post_count DESC
LIMIT 10;

-- Index recommendations
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'posts'
AND schemaname = 'public'
ORDER BY n_distinct DESC;
```

**Common Performance Issues:**
```sql
-- Avoid N+1 queries - Bad
SELECT * FROM users;
-- Then for each user:
-- SELECT * FROM posts WHERE user_id = ?

-- Use JOIN instead - Good
SELECT u.*, p.title, p.created_at
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
ORDER BY u.id, p.created_at DESC;

-- Avoid functions in WHERE clause - Bad
SELECT * FROM posts WHERE EXTRACT(YEAR FROM created_at) = 2023;

-- Use range instead - Good
SELECT * FROM posts 
WHERE created_at >= '2023-01-01' 
AND created_at < '2024-01-01';

-- Use covering indexes
CREATE INDEX idx_posts_covering 
ON posts(user_id, created_at) 
INCLUDE (title, content);
```

---

## ❓ Interview Questions & Answers

### SQL Basics

**Q1: Difference between INNER JOIN and LEFT JOIN?**
**A:** INNER JOIN returns only matching records from both tables. LEFT JOIN returns all records from the left table and matching records from the right table, with NULL for non-matching right records.

**Q2: What is a transaction and ACID properties?**
**A:** A transaction is a unit of work that is either completely executed or not executed at all.
- **Atomicity**: All or nothing
- **Consistency**: Database remains valid
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

**Q3: Explain the difference between WHERE and HAVING clauses**
**A:**
- **WHERE**: Filters rows before grouping
- **HAVING**: Filters groups after GROUP BY

```sql
-- WHERE filters individual rows
SELECT department, COUNT(*) as emp_count
FROM employees
WHERE salary > 50000  -- Filter individual employees
GROUP BY department;

-- HAVING filters groups
SELECT department, COUNT(*) as emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;  -- Filter departments with more than 5 employees
```

**Q4: What are the different types of indexes?**
**A:**
- **Clustered**: Physical order matches index order (one per table)
- **Non-clustered**: Logical index separate from data storage
- **Unique**: Ensures uniqueness
- **Composite**: Multiple columns
- **Partial**: Only subset of rows

```sql
-- Different index types
CREATE UNIQUE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_name_age ON users(name, age);  -- Composite
CREATE INDEX idx_active_users ON users(id) WHERE active = true;  -- Partial
```

**Q5: Explain database normalization forms**
**A:**
- **1NF**: Atomic values, no repeating groups
- **2NF**: 1NF + no partial dependencies
- **3NF**: 2NF + no transitive dependencies
- **BCNF**: 3NF + every determinant is a candidate key

```sql
-- Unnormalized
CREATE TABLE orders_bad (
    order_id INT,
    customer_name VARCHAR(100),
    items VARCHAR(500), -- 'item1,item2,item3' - violates 1NF
    total DECIMAL(10,2)
);

-- Normalized (3NF)
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    total DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INT REFERENCES orders(order_id),
    item_name VARCHAR(100),
    quantity INT,
    price DECIMAL(10,2)
);
```

### Advanced SQL

**Q6: Explain window functions vs GROUP BY**
**A:** Window functions perform calculations across rows related to the current row without collapsing rows like GROUP BY. They maintain row-level detail while providing aggregate information.

**Q7: What are the different types of indexes?**
**A:** 
- **B-tree**: Default, good for equality and range queries
- **Hash**: Fast equality lookups
- **GIN/GiST**: Full-text search and complex data types
- **Partial**: Index with WHERE condition
- **Composite**: Multiple columns

**Q8: How do you optimize a slow query?**
**A:**
```sql
-- Step 1: Analyze query execution plan
EXPLAIN (ANALYZE, BUFFERS) 
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2023-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;

-- Step 2: Add appropriate indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Step 3: Rewrite query for better performance
WITH user_orders AS (
    SELECT 
        u.id,
        u.name,
        COUNT(o.id) as order_count
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id  -- Use INNER JOIN if we only need users with orders
    WHERE u.created_at > '2023-01-01'
    GROUP BY u.id, u.name
)
SELECT * FROM user_orders WHERE order_count > 5;
```

**Q9: What's the difference between DELETE, TRUNCATE, and DROP?**
**A:**
```sql
-- DELETE: Removes specific rows, can be rolled back, triggers fire
DELETE FROM users WHERE last_login < '2022-01-01';

-- TRUNCATE: Removes all rows, faster, can't be rolled back, no triggers
TRUNCATE TABLE users;

-- DROP: Removes entire table structure and data
DROP TABLE users;
```

**Q10: How do you handle hierarchical data in SQL?**
**A:**
```sql
-- Adjacency List Model
CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    parent_id INT REFERENCES categories(id)
);

-- Recursive CTE to get hierarchy
WITH RECURSIVE category_tree AS (
    -- Root categories
    SELECT id, name, parent_id, 0 as level, ARRAY[id] as path
    FROM categories 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Child categories
    SELECT c.id, c.name, c.parent_id, ct.level + 1, ct.path || c.id
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
    WHERE NOT c.id = ANY(ct.path)  -- Prevent infinite loops
)
SELECT 
    REPEAT('  ', level) || name as indented_name,
    level,
    path
FROM category_tree
ORDER BY path;

-- Nested Set Model (alternative for better read performance)
CREATE TABLE categories_nested (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    lft INT,
    rgt INT
);

-- Get all descendants of a category
SELECT child.*
FROM categories_nested parent, categories_nested child
WHERE child.lft BETWEEN parent.lft AND parent.rgt
AND parent.id = 5;  -- Category ID 5
```

**Q11: Explain database deadlocks and how to prevent them**
**A:**
```sql
-- Deadlock scenario
-- Transaction 1:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- ... some processing time
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- Transaction 2 (running simultaneously):
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;
-- ... some processing time
UPDATE accounts SET balance = balance + 50 WHERE id = 1;
COMMIT;

-- Prevention strategies:
-- 1. Consistent ordering
BEGIN;
UPDATE accounts SET balance = balance - 100 
WHERE id = LEAST(1, 2);  -- Always update lower ID first
UPDATE accounts SET balance = balance + 100 
WHERE id = GREATEST(1, 2);
COMMIT;

-- 2. Shorter transactions
BEGIN;
SELECT balance FROM accounts WHERE id IN (1, 2) FOR UPDATE;
-- Perform calculations outside DB
UPDATE accounts SET balance = calculated_balance WHERE id = 1;
UPDATE accounts SET balance = calculated_balance WHERE id = 2;
COMMIT;

-- 3. Use appropriate isolation levels
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### NoSQL

**Q12: When to use NoSQL over SQL?**
**A:** Use NoSQL when:
- Rapid development with changing schemas
- Massive scale requirements
- Non-relational data structures
- Geographic distribution
- Real-time analytics

**Q13: Explain MongoDB aggregation pipeline**
**A:** A framework for data aggregation using stages like $match, $group, $sort, $project. Each stage transforms the data and passes it to the next stage.

**Q14: Design a MongoDB schema for an e-commerce system**
**A:**
```typescript
// Product schema with embedded reviews
interface Product {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  category: {
    id: ObjectId;
    name: string;
  };
  images: string[];
  specifications: {
    [key: string]: any;
  };
  reviews: Array<{
    userId: ObjectId;
    rating: number;
    comment: string;
    helpful: number;
    createdAt: Date;
  }>;
  stats: {
    averageRating: number;
    totalReviews: number;
    totalSales: number;
  };
  inventory: {
    quantity: number;
    reserved: number;
    warehouse: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Aggregation pipeline for product analytics
const productAnalytics = [
  // Match active products
  { $match: { isActive: true } },
  
  // Unwind reviews for individual analysis
  { $unwind: '$reviews' },
  
  // Group by category and calculate metrics
  {
    $group: {
      _id: '$category.name',
      totalProducts: { $sum: 1 },
      averagePrice: { $avg: '$price' },
      averageRating: { $avg: '$reviews.rating' },
      totalReviews: { $sum: 1 },
      topSellingProduct: {
        $max: {
          name: '$name',
          sales: '$stats.totalSales'
        }
      }
    }
  },
  
  // Sort by total products
  { $sort: { totalProducts: -1 } },
  
  // Add percentage of total
  {
    $group: {
      _id: null,
      categories: { $push: '$$ROOT' },
      totalProductsAllCategories: { $sum: '$totalProducts' }
    }
  },
  
  {
    $unwind: '$categories'
  },
  
  {
    $project: {
      _id: '$categories._id',
      totalProducts: '$categories.totalProducts',
      percentage: {
        $multiply: [
          { $divide: ['$categories.totalProducts', '$totalProductsAllCategories'] },
          100
        ]
      },
      averagePrice: '$categories.averagePrice',
      averageRating: '$categories.averageRating'
    }
  }
];
```

**Q15: How do you implement transactions in MongoDB?**
**A:**
```typescript
import { MongoClient } from 'mongodb';

async function transferMoney(fromAccount: string, toAccount: string, amount: number) {
  const session = client.startSession();
  
  try {
    await session.withTransaction(async () => {
      const accounts = db.collection('accounts');
      
      // Check source account balance
      const fromAccountDoc = await accounts.findOne(
        { _id: fromAccount },
        { session }
      );
      
      if (!fromAccountDoc || fromAccountDoc.balance < amount) {
        throw new Error('Insufficient funds');
      }
      
      // Debit from source account
      await accounts.updateOne(
        { _id: fromAccount },
        { 
          $inc: { balance: -amount },
          $push: {
            transactions: {
              type: 'debit',
              amount,
              to: toAccount,
              timestamp: new Date()
            }
          }
        },
        { session }
      );
      
      // Credit to destination account
      await accounts.updateOne(
        { _id: toAccount },
        { 
          $inc: { balance: amount },
          $push: {
            transactions: {
              type: 'credit',
              amount,
              from: fromAccount,
              timestamp: new Date()
            }
          }
        },
        { session }
      );
    });
    
    console.log('Transfer completed successfully');
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}
```

### Performance

**Q16: How to identify slow queries?**
**A:** 
- Enable query logging
- Use EXPLAIN ANALYZE
- Monitor with tools like pg_stat_statements
- Set up performance monitoring
- Regular index maintenance

**Q17: Explain database connection pooling**
**A:**
```typescript
// Connection pool implementation
class DatabasePool {
  private pool: Connection[] = [];
  private activeConnections = new Set<Connection>();
  private maxSize: number;
  private minSize: number;
  
  constructor(config: PoolConfig) {
    this.maxSize = config.maxSize;
    this.minSize = config.minSize;
    this.initializePool();
  }
  
  async getConnection(): Promise<Connection> {
    // Try to get an existing idle connection
    if (this.pool.length > 0) {
      const connection = this.pool.pop()!;
      this.activeConnections.add(connection);
      return connection;
    }
    
    // Create new connection if under max limit
    if (this.activeConnections.size < this.maxSize) {
      const connection = await this.createConnection();
      this.activeConnections.add(connection);
      return connection;
    }
    
    // Wait for a connection to become available
    return this.waitForConnection();
  }
  
  releaseConnection(connection: Connection): void {
    this.activeConnections.delete(connection);
    
    if (this.pool.length < this.minSize && connection.isHealthy()) {
      this.pool.push(connection);
    } else {
      connection.close();
    }
  }
  
  async executeQuery<T>(query: string, params: any[]): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      return await connection.query(query, params);
    } finally {
      this.releaseConnection(connection);
    }
  }
  
  // Health check and maintenance
  async maintainPool(): Promise<void> {
    // Remove stale connections
    const healthyConnections = [];
    
    for (const connection of this.pool) {
      if (await connection.ping()) {
        healthyConnections.push(connection);
      } else {
        connection.close();
      }
    }
    
    this.pool = healthyConnections;
    
    // Ensure minimum pool size
    while (this.pool.length < this.minSize) {
      const connection = await this.createConnection();
      this.pool.push(connection);
    }
  }
}
```

**Q18: How do you implement database sharding?**
**A:**
```typescript
// Database sharding implementation
interface ShardConfig {
  id: string;
  connectionString: string;
  keyRanges: { min: string; max: string }[];
}

class ShardedDatabase {
  private shards: Map<string, Database> = new Map();
  private shardConfigs: ShardConfig[];
  
  constructor(configs: ShardConfig[]) {
    this.shardConfigs = configs;
    this.initializeShards();
  }
  
  // Hash-based sharding
  private getShardByHash(key: string): Database {
    const hash = this.calculateHash(key);
    const shardIndex = hash % this.shardConfigs.length;
    const shardId = this.shardConfigs[shardIndex].id;
    return this.shards.get(shardId)!;
  }
  
  // Range-based sharding
  private getShardByRange(key: string): Database {
    for (const config of this.shardConfigs) {
      for (const range of config.keyRanges) {
        if (key >= range.min && key <= range.max) {
          return this.shards.get(config.id)!;
        }
      }
    }
    throw new Error(`No shard found for key: ${key}`);
  }
  
  async insert(key: string, data: any): Promise<void> {
    const shard = this.getShardByHash(key);
    return shard.insert(key, data);
  }
  
  async find(key: string): Promise<any> {
    const shard = this.getShardByHash(key);
    return shard.find(key);
  }
  
  // Cross-shard queries (scatter-gather)
  async findAll(query: any): Promise<any[]> {
    const promises = Array.from(this.shards.values()).map(shard =>
      shard.findMany(query).catch(() => []) // Continue on individual shard failures
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  }
  
  // Distributed transactions using 2-phase commit
  async distributedTransaction(operations: ShardOperation[]): Promise<void> {
    const transactionId = this.generateTransactionId();
    const participatingShards = new Set<Database>();
    
    // Identify participating shards
    operations.forEach(op => {
      const shard = this.getShardByHash(op.key);
      participatingShards.add(shard);
    });
    
    try {
      // Phase 1: Prepare
      const preparePromises = Array.from(participatingShards).map(shard =>
        shard.prepare(transactionId, operations.filter(op => 
          this.getShardByHash(op.key) === shard
        ))
      );
      
      await Promise.all(preparePromises);
      
      // Phase 2: Commit
      const commitPromises = Array.from(participatingShards).map(shard =>
        shard.commit(transactionId)
      );
      
      await Promise.all(commitPromises);
      
    } catch (error) {
      // Rollback on any failure
      const rollbackPromises = Array.from(participatingShards).map(shard =>
        shard.rollback(transactionId).catch(() => {}) // Log but don't throw
      );
      
      await Promise.all(rollbackPromises);
      throw error;
    }
  }
  
  private calculateHash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface ShardOperation {
  type: 'insert' | 'update' | 'delete';
  key: string;
  data?: any;
}
```

**Q19: How do you implement database caching strategies?**
**A:**
```typescript
// Multi-level caching strategy
class DatabaseCaching {
  private l1Cache: Map<string, any> = new Map(); // In-memory
  private l2Cache: Redis; // Redis
  private database: Database;
  
  constructor(redisClient: Redis, database: Database) {
    this.l2Cache = redisClient;
    this.database = database;
  }
  
  // Cache-aside pattern
  async get(key: string): Promise<any> {
    // L1 Cache (memory)
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2 Cache (Redis)
    const cachedValue = await this.l2Cache.get(key);
    if (cachedValue) {
      const parsed = JSON.parse(cachedValue);
      this.l1Cache.set(key, parsed);
      return parsed;
    }
    
    // Database
    const dbValue = await this.database.find(key);
    if (dbValue) {
      // Cache in both levels
      this.l1Cache.set(key, dbValue);
      await this.l2Cache.setex(key, 3600, JSON.stringify(dbValue));
    }
    
    return dbValue;
  }
  
  // Write-through pattern
  async set(key: string, value: any): Promise<void> {
    // Update database first
    await this.database.update(key, value);
    
    // Update both cache levels
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, 3600, JSON.stringify(value));
  }
  
  // Write-behind pattern
  async setAsync(key: string, value: any): Promise<void> {
    // Update cache immediately
    this.l1Cache.set(key, value);
    await this.l2Cache.setex(key, 3600, JSON.stringify(value));
    
    // Queue database update
    this.queueDatabaseUpdate(key, value);
  }
  
  // Cache invalidation
  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    await this.l2Cache.del(key);
  }
  
  // Bulk operations
  async mget(keys: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const missedKeys: string[] = [];
    
    // Check L1 cache
    keys.forEach(key => {
      if (this.l1Cache.has(key)) {
        result[key] = this.l1Cache.get(key);
      } else {
        missedKeys.push(key);
      }
    });
    
    if (missedKeys.length === 0) return result;
    
    // Check L2 cache
    const l2Results = await this.l2Cache.mget(missedKeys);
    const dbKeys: string[] = [];
    
    missedKeys.forEach((key, index) => {
      if (l2Results[index]) {
        const parsed = JSON.parse(l2Results[index]);
        result[key] = parsed;
        this.l1Cache.set(key, parsed);
      } else {
        dbKeys.push(key);
      }
    });
    
    if (dbKeys.length === 0) return result;
    
    // Fetch from database
    const dbResults = await this.database.mget(dbKeys);
    
    for (const [key, value] of Object.entries(dbResults)) {
      result[key] = value;
      this.l1Cache.set(key, value);
      await this.l2Cache.setex(key, 3600, JSON.stringify(value));
    }
    
    return result;
  }
}
```

This comprehensive database guide covers essential concepts for both SQL and NoSQL databases with practical examples and optimization techniques. 