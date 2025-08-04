# 🏗️ System Design Complete Interview Guide

## Table of Contents
1. [System Design Fundamentals](#system-design-fundamentals)
2. [API Design Patterns](#api-design-patterns)
3. [Scalability and Performance](#scalability-and-performance)
4. [Security and Authentication](#security-and-authentication)
5. [Microservices Architecture](#microservices-architecture)
6. [System Design Questions](#system-design-questions)

---

## 🟢 System Design Fundamentals

### 1. Scalability Concepts

**Horizontal vs Vertical Scaling:**

**Vertical Scaling (Scale Up):**
```typescript
// Before scaling - Single server
interface ServerConfig {
  cpu: number;
  memory: number;
  storage: number;
}

const singleServer: ServerConfig = {
  cpu: 4,      // 4 cores
  memory: 16,  // 16 GB RAM
  storage: 500 // 500 GB
};

// After vertical scaling
const upgradedServer: ServerConfig = {
  cpu: 16,     // 16 cores
  memory: 64,  // 64 GB RAM
  storage: 2000 // 2 TB
};
```

**Horizontal Scaling (Scale Out):**
```typescript
// Load balancer distributing traffic
interface LoadBalancer {
  algorithm: 'round-robin' | 'least-connections' | 'weighted';
  servers: Server[];
  healthCheck: boolean;
}

interface Server {
  id: string;
  ip: string;
  port: number;
  isHealthy: boolean;
  currentConnections: number;
}

class LoadBalancer {
  private servers: Server[] = [];
  private currentIndex = 0;
  
  addServer(server: Server): void {
    this.servers.push(server);
  }
  
  removeServer(serverId: string): void {
    this.servers = this.servers.filter(s => s.id !== serverId);
  }
  
  getNextServer(): Server | null {
    const healthyServers = this.servers.filter(s => s.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }
    
    // Round-robin algorithm
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    return server;
  }
  
  async checkHealth(): Promise<void> {
    const healthChecks = this.servers.map(async (server) => {
      try {
        const response = await fetch(`http://${server.ip}:${server.port}/health`);
        server.isHealthy = response.ok;
      } catch (error) {
        server.isHealthy = false;
      }
    });
    
    await Promise.all(healthChecks);
  }
}
```

### 2. Caching Strategies

**Multi-Level Caching:**
```typescript
// Cache levels enum
enum CacheLevel {
  BROWSER = 'browser',
  CDN = 'cdn',
  REVERSE_PROXY = 'reverse-proxy',
  APPLICATION = 'application',
  DATABASE = 'database'
}

// Cache interface
interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Redis cache implementation
class RedisCache<T> implements Cache<T> {
  private redis: any; // Redis client
  
  constructor(redisClient: any) {
    this.redis = redisClient;
  }
  
  async get(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Multi-level cache with fallback
class MultiLevelCache<T> {
  private caches: Cache<T>[];
  
  constructor(caches: Cache<T>[]) {
    this.caches = caches;
  }
  
  async get(key: string): Promise<T | null> {
    for (let i = 0; i < this.caches.length; i++) {
      const value = await this.caches[i].get(key);
      
      if (value !== null) {
        // Populate higher-level caches
        for (let j = 0; j < i; j++) {
          await this.caches[j].set(key, value);
        }
        return value;
      }
    }
    
    return null;
  }
  
  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Set in all cache levels
    const promises = this.caches.map(cache => cache.set(key, value, ttl));
    await Promise.all(promises);
  }
}
```

### 3. Database Sharding and Replication

**Database Sharding:**
```typescript
interface ShardConfig {
  id: string;
  host: string;
  port: number;
  database: string;
  minKey: string;
  maxKey: string;
}

class DatabaseSharding {
  private shards: ShardConfig[];
  
  constructor(shards: ShardConfig[]) {
    this.shards = shards.sort((a, b) => a.minKey.localeCompare(b.minKey));
  }
  
  // Hash-based sharding
  getShardByHash(key: string): ShardConfig {
    const hash = this.hash(key);
    const shardIndex = hash % this.shards.length;
    return this.shards[shardIndex];
  }
  
  // Range-based sharding
  getShardByRange(key: string): ShardConfig {
    for (const shard of this.shards) {
      if (key >= shard.minKey && key <= shard.maxKey) {
        return shard;
      }
    }
    throw new Error(`No shard found for key: ${key}`);
  }
  
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  // Consistent hashing for better distribution
  getShardByConsistentHash(key: string): ShardConfig {
    const hash = this.hash(key);
    const ring = this.createHashRing();
    
    for (const point of ring) {
      if (hash <= point.hash) {
        return point.shard;
      }
    }
    
    return ring[0].shard; // Wrap around
  }
  
  private createHashRing(): Array<{hash: number, shard: ShardConfig}> {
    const ring: Array<{hash: number, shard: ShardConfig}> = [];
    
    this.shards.forEach(shard => {
      // Multiple virtual nodes per shard for better distribution
      for (let i = 0; i < 100; i++) {
        const virtualNode = `${shard.id}-${i}`;
        ring.push({
          hash: this.hash(virtualNode),
          shard
        });
      }
    });
    
    return ring.sort((a, b) => a.hash - b.hash);
  }
}
```

**Master-Slave Replication:**
```typescript
enum DatabaseRole {
  MASTER = 'master',
  SLAVE = 'slave'
}

interface DatabaseConnection {
  id: string;
  host: string;
  port: number;
  role: DatabaseRole;
  isHealthy: boolean;
  lag: number; // Replication lag in milliseconds
}

class DatabaseCluster {
  private master: DatabaseConnection;
  private slaves: DatabaseConnection[];
  
  constructor(master: DatabaseConnection, slaves: DatabaseConnection[]) {
    this.master = master;
    this.slaves = slaves;
  }
  
  // Write operations go to master
  async write(query: string, params: any[]): Promise<any> {
    if (!this.master.isHealthy) {
      throw new Error('Master database is not available');
    }
    
    return this.executeQuery(this.master, query, params);
  }
  
  // Read operations can use slaves
  async read(query: string, params: any[]): Promise<any> {
    const healthySlaves = this.slaves.filter(slave => 
      slave.isHealthy && slave.lag < 1000 // Less than 1 second lag
    );
    
    if (healthySlaves.length > 0) {
      // Load balance across healthy slaves
      const slave = healthySlaves[Math.floor(Math.random() * healthySlaves.length)];
      return this.executeQuery(slave, query, params);
    }
    
    // Fallback to master if no healthy slaves
    return this.executeQuery(this.master, query, params);
  }
  
  // Handle failover
  async handleFailover(): Promise<void> {
    if (!this.master.isHealthy) {
      // Promote slave with lowest lag to master
      const bestSlave = this.slaves
        .filter(slave => slave.isHealthy)
        .sort((a, b) => a.lag - b.lag)[0];
      
      if (bestSlave) {
        console.log(`Promoting slave ${bestSlave.id} to master`);
        bestSlave.role = DatabaseRole.MASTER;
        this.master = bestSlave;
        this.slaves = this.slaves.filter(slave => slave.id !== bestSlave.id);
      }
    }
  }
  
  private async executeQuery(db: DatabaseConnection, query: string, params: any[]): Promise<any> {
    // Database-specific implementation
    console.log(`Executing query on ${db.role} ${db.id}: ${query}`);
    // Return query result
  }
}
```

---

## 🌐 API Design Patterns

### 1. RESTful API Design

**Resource-Based URLs:**
```typescript
// Good RESTful design
interface RESTEndpoints {
  // Users resource
  'GET /api/users': 'Get all users';
  'GET /api/users/:id': 'Get specific user';
  'POST /api/users': 'Create new user';
  'PUT /api/users/:id': 'Update entire user';
  'PATCH /api/users/:id': 'Partial update user';
  'DELETE /api/users/:id': 'Delete user';
  
  // Nested resources
  'GET /api/users/:id/posts': 'Get user posts';
  'POST /api/users/:id/posts': 'Create post for user';
  'GET /api/posts/:id/comments': 'Get post comments';
  'POST /api/posts/:id/comments': 'Add comment to post';
}

// HTTP Status codes
enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  
  // Client errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  
  // Server errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Standardized API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Response builder utility
class ResponseBuilder {
  static success<T>(data: T, pagination?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        requestId: this.generateRequestId()
      }
    };
  }
  
  static error(code: string, message: string, details?: any): ApiResponse<null> {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        requestId: this.generateRequestId()
      }
    };
  }
  
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 2. GraphQL API Design

**GraphQL Schema and Resolvers:**
```typescript
// GraphQL type definitions
const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    createdAt: String!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    tags: [String!]!
    publishedAt: String
  }
  
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
  }
  
  type Query {
    users(limit: Int, offset: Int): [User!]!
    user(id: ID!): User
    posts(authorId: ID, tags: [String!]): [Post!]!
    post(id: ID!): Post
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    createPost(input: CreatePostInput!): Post!
    publishPost(id: ID!): Post!
    deletePost(id: ID!): Boolean!
  }
  
  type Subscription {
    postAdded: Post!
    commentAdded(postId: ID!): Comment!
  }
  
  input CreateUserInput {
    name: String!
    email: String!
  }
  
  input UpdateUserInput {
    name: String
    email: String
  }
  
  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
    tags: [String!]
  }
`;

// GraphQL resolvers with DataLoader for N+1 problem
class GraphQLResolvers {
  private userLoader: DataLoader<string, User>;
  private postLoader: DataLoader<string, Post>;
  
  constructor() {
    this.userLoader = new DataLoader(this.batchUsers.bind(this));
    this.postLoader = new DataLoader(this.batchPosts.bind(this));
  }
  
  resolvers = {
    Query: {
      users: async (_, { limit = 10, offset = 0 }) => {
        return this.userService.getUsers({ limit, offset });
      },
      
      user: async (_, { id }) => {
        return this.userLoader.load(id);
      },
      
      posts: async (_, { authorId, tags }) => {
        return this.postService.getPosts({ authorId, tags });
      }
    },
    
    Mutation: {
      createUser: async (_, { input }) => {
        return this.userService.createUser(input);
      },
      
      createPost: async (_, { input }, context) => {
        // Check authentication
        if (!context.user) {
          throw new Error('Authentication required');
        }
        
        return this.postService.createPost(input);
      }
    },
    
    Subscription: {
      postAdded: {
        subscribe: () => pubsub.asyncIterator(['POST_ADDED'])
      },
      
      commentAdded: {
        subscribe: (_, { postId }) => 
          pubsub.asyncIterator([`COMMENT_ADDED_${postId}`])
      }
    },
    
    User: {
      posts: async (user) => {
        return this.postService.getPostsByAuthor(user.id);
      }
    },
    
    Post: {
      author: async (post) => {
        return this.userLoader.load(post.authorId);
      },
      
      comments: async (post) => {
        return this.commentService.getCommentsByPost(post.id);
      }
    },
    
    Comment: {
      author: async (comment) => {
        return this.userLoader.load(comment.authorId);
      },
      
      post: async (comment) => {
        return this.postLoader.load(comment.postId);
      }
    }
  };
  
  private async batchUsers(ids: readonly string[]): Promise<User[]> {
    const users = await this.userService.getUsersByIds([...ids]);
    return ids.map(id => users.find(user => user.id === id));
  }
  
  private async batchPosts(ids: readonly string[]): Promise<Post[]> {
    const posts = await this.postService.getPostsByIds([...ids]);
    return ids.map(id => posts.find(post => post.id === id));
  }
}
```

### 3. Rate Limiting and Throttling

**Token Bucket Algorithm:**
```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private initialTokens: number = capacity
  ) {
    this.tokens = initialTokens;
    this.lastRefill = Date.now();
  }
  
  consume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const timeDiff = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = Math.floor(timeDiff * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
  
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Redis-based distributed rate limiting
class DistributedRateLimiter {
  private redis: any;
  
  constructor(redisClient: any) {
    this.redis = redisClient;
  }
  
  async checkLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const multi = this.redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, Math.ceil(windowMs / 1000));
    
    const results = await multi.exec();
    const count = results[0][1];
    
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetTime = (window + 1) * windowMs;
    
    return {
      allowed,
      remaining,
      resetTime
    };
  }
}

// Express middleware for rate limiting
const createRateLimitMiddleware = (limiter: DistributedRateLimiter) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.user?.id || 'anonymous';
    const result = await limiter.checkLimit(identifier, 100, 60000); // 100 requests per minute
    
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }
    
    next();
  };
};
```

---

## 🔒 Security and Authentication

### 1. JWT Authentication System

**JWT Service Implementation:**
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  
  constructor() {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
  }
  
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'your-api',
      audience: 'your-app'
    });
    
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'your-api',
        audience: 'your-app'
      }
    );
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }
  
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }
  
  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as { userId: string };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const decoded = this.verifyRefreshToken(refreshToken);
    
    // Check if refresh token is blacklisted
    const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new Error('Refresh token has been revoked');
    }
    
    // Fetch user data
    const user = await this.getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return this.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    });
  }
  
  async revokeToken(token: string): Promise<void> {
    // Add token to blacklist (Redis with expiration)
    const decoded = jwt.decode(token) as JwtPayload;
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.redis.setex(`blacklist:${token}`, ttl, '1');
      }
    }
  }
  
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result === '1';
  }
}
```

### 2. OAuth 2.0 Implementation

**OAuth 2.0 Authorization Server:**
```typescript
interface OAuthClient {
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
  grantTypes: string[];
  scopes: string[];
}

interface AuthorizationCode {
  code: string;
  clientId: string;
  userId: string;
  scopes: string[];
  redirectUri: string;
  expiresAt: Date;
}

class OAuthServer {
  private clients: Map<string, OAuthClient> = new Map();
  private authCodes: Map<string, AuthorizationCode> = new Map();
  
  // Register OAuth client
  registerClient(client: OAuthClient): void {
    this.clients.set(client.clientId, client);
  }
  
  // Authorization endpoint
  async authorize(params: {
    clientId: string;
    redirectUri: string;
    responseType: string;
    scope: string;
    state?: string;
    userId: string;
  }): Promise<string> {
    const { clientId, redirectUri, responseType, scope, state, userId } = params;
    
    // Validate client
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Invalid client');
    }
    
    // Validate redirect URI
    if (!client.redirectUris.includes(redirectUri)) {
      throw new Error('Invalid redirect URI');
    }
    
    // Validate response type
    if (responseType !== 'code') {
      throw new Error('Unsupported response type');
    }
    
    // Validate scopes
    const requestedScopes = scope.split(' ');
    const invalidScopes = requestedScopes.filter(s => !client.scopes.includes(s));
    if (invalidScopes.length > 0) {
      throw new Error(`Invalid scopes: ${invalidScopes.join(', ')}`);
    }
    
    // Generate authorization code
    const code = this.generateAuthCode();
    const authCode: AuthorizationCode = {
      code,
      clientId,
      userId,
      scopes: requestedScopes,
      redirectUri,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    
    this.authCodes.set(code, authCode);
    
    // Build redirect URL
    const url = new URL(redirectUri);
    url.searchParams.set('code', code);
    if (state) {
      url.searchParams.set('state', state);
    }
    
    return url.toString();
  }
  
  // Token endpoint
  async token(params: {
    grantType: string;
    code?: string;
    redirectUri?: string;
    clientId: string;
    clientSecret: string;
    refreshToken?: string;
  }): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
  }> {
    const { grantType, code, redirectUri, clientId, clientSecret, refreshToken } = params;
    
    // Validate client credentials
    const client = this.clients.get(clientId);
    if (!client || client.clientSecret !== clientSecret) {
      throw new Error('Invalid client credentials');
    }
    
    if (grantType === 'authorization_code') {
      if (!code || !redirectUri) {
        throw new Error('Missing required parameters');
      }
      
      const authCode = this.authCodes.get(code);
      if (!authCode) {
        throw new Error('Invalid authorization code');
      }
      
      if (authCode.expiresAt < new Date()) {
        this.authCodes.delete(code);
        throw new Error('Authorization code expired');
      }
      
      if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
        throw new Error('Invalid client or redirect URI');
      }
      
      // Generate tokens
      const tokenPair = this.authService.generateTokenPair({
        userId: authCode.userId,
        email: '', // Fetch from user service
        role: 'user'
      });
      
      // Clean up used authorization code
      this.authCodes.delete(code);
      
      return {
        accessToken: tokenPair.accessToken,
        tokenType: 'Bearer',
        expiresIn: tokenPair.expiresIn,
        refreshToken: tokenPair.refreshToken,
        scope: authCode.scopes.join(' ')
      };
    }
    
    if (grantType === 'refresh_token') {
      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }
      
      const tokenPair = await this.authService.refreshAccessToken(refreshToken);
      
      return {
        accessToken: tokenPair.accessToken,
        tokenType: 'Bearer',
        expiresIn: tokenPair.expiresIn,
        refreshToken: tokenPair.refreshToken,
        scope: 'read write'
      };
    }
    
    throw new Error('Unsupported grant type');
  }
  
  private generateAuthCode(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  }
}
```

---

## 🏗️ Microservices Architecture

### 1. Service Communication Patterns

**API Gateway Pattern:**
```typescript
interface ServiceRoute {
  path: string;
  method: string;
  serviceUrl: string;
  authRequired: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
  timeout: number;
}

class APIGateway {
  private routes: ServiceRoute[] = [];
  private loadBalancer: LoadBalancer;
  private rateLimiter: DistributedRateLimiter;
  
  constructor() {
    this.loadBalancer = new LoadBalancer();
    this.rateLimiter = new DistributedRateLimiter(redis);
  }
  
  addRoute(route: ServiceRoute): void {
    this.routes.push(route);
  }
  
  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      // Find matching route
      const route = this.findRoute(req.path, req.method);
      if (!route) {
        res.status(404).json({ error: 'Route not found' });
        return;
      }
      
      // Authentication check
      if (route.authRequired) {
        const authResult = await this.authenticate(req);
        if (!authResult.success) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
      }
      
      // Rate limiting
      if (route.rateLimit) {
        const limitResult = await this.rateLimiter.checkLimit(
          req.ip,
          route.rateLimit.requests,
          route.rateLimit.window
        );
        
        if (!limitResult.allowed) {
          res.status(429).json({ error: 'Rate limit exceeded' });
          return;
        }
      }
      
      // Forward request to service
      const response = await this.forwardRequest(req, route);
      
      // Return response
      res.status(response.status).json(response.data);
      
    } catch (error) {
      console.error('Gateway error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  private findRoute(path: string, method: string): ServiceRoute | undefined {
    return this.routes.find(route => 
      this.matchPath(route.path, path) && route.method === method
    );
  }
  
  private matchPath(routePath: string, requestPath: string): boolean {
    // Simple path matching - could be enhanced with regex
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');
    
    if (routeParts.length !== requestParts.length) {
      return false;
    }
    
    return routeParts.every((part, index) => 
      part.startsWith(':') || part === requestParts[index]
    );
  }
  
  private async forwardRequest(req: Request, route: ServiceRoute): Promise<any> {
    const serviceUrl = this.buildServiceUrl(req, route);
    
    const response = await fetch(serviceUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        'X-Gateway-Request-ID': this.generateRequestId()
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      signal: AbortSignal.timeout(route.timeout)
    });
    
    return {
      status: response.status,
      data: await response.json()
    };
  }
  
  private buildServiceUrl(req: Request, route: ServiceRoute): string {
    let url = route.serviceUrl + req.path;
    
    if (req.query && Object.keys(req.query).length > 0) {
      const queryString = new URLSearchParams(req.query as any).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }
}
```

### 2. Event-Driven Architecture

**Message Bus Implementation:**
```typescript
interface Event {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  version: string;
}

interface EventHandler {
  eventType: string;
  handler: (event: Event) => Promise<void>;
  retryPolicy?: RetryPolicy;
}

interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private deadLetterQueue: Event[] = [];
  
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    const promises = handlers.map(handler => 
      this.processEvent(event, handler)
    );
    
    await Promise.allSettled(promises);
  }
  
  private async processEvent(event: Event, handler: EventHandler): Promise<void> {
    const retryPolicy = handler.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      maxBackoffMs: 30000
    };
    
    let attempt = 0;
    let delay = 1000; // Start with 1 second
    
    while (attempt <= retryPolicy.maxRetries) {
      try {
        await handler.handler(event);
        return; // Success
      } catch (error) {
        attempt++;
        console.error(`Event handler failed (attempt ${attempt}):`, error);
        
        if (attempt > retryPolicy.maxRetries) {
          // Send to dead letter queue
          this.deadLetterQueue.push({
            ...event,
            id: `dlq_${event.id}_${Date.now()}`
          });
          break;
        }
        
        // Wait before retry
        await this.sleep(Math.min(delay, retryPolicy.maxBackoffMs));
        delay *= retryPolicy.backoffMultiplier;
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getDeadLetterQueue(): Event[] {
    return [...this.deadLetterQueue];
  }
  
  async reprocessDeadLetterEvent(eventId: string): Promise<void> {
    const eventIndex = this.deadLetterQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found in dead letter queue');
    }
    
    const event = this.deadLetterQueue[eventIndex];
    this.deadLetterQueue.splice(eventIndex, 1);
    
    await this.publish(event);
  }
}

// Service example using event bus
class UserService {
  constructor(private eventBus: EventBus) {
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.eventBus.subscribe('user.created', {
      eventType: 'user.created',
      handler: this.handleUserCreated.bind(this)
    });
    
    this.eventBus.subscribe('user.updated', {
      eventType: 'user.updated',
      handler: this.handleUserUpdated.bind(this)
    });
  }
  
  async createUser(userData: any): Promise<User> {
    const user = await this.userRepository.create(userData);
    
    // Publish event
    await this.eventBus.publish({
      id: `user_created_${user.id}_${Date.now()}`,
      type: 'user.created',
      payload: user,
      timestamp: new Date(),
      source: 'user-service',
      version: '1.0'
    });
    
    return user;
  }
  
  private async handleUserCreated(event: Event): Promise<void> {
    const user = event.payload;
    console.log(`User created: ${user.name} (${user.email})`);
    
    // Send welcome email, update analytics, etc.
    await this.emailService.sendWelcomeEmail(user.email);
    await this.analyticsService.trackUserCreation(user.id);
  }
  
  private async handleUserUpdated(event: Event): Promise<void> {
    const user = event.payload;
    console.log(`User updated: ${user.id}`);
    
    // Update search index, invalidate cache, etc.
    await this.searchService.updateUserIndex(user);
    await this.cacheService.invalidateUser(user.id);
  }
}
```

---

## ❓ System Design Interview Questions

### Basic Level

**Q1: Design a URL shortener like bit.ly**
**A:** Key components:
- **Database**: Store long URL → short URL mapping
- **Encoding**: Base62 encoding for short URLs
- **Caching**: Redis for frequently accessed URLs
- **Analytics**: Track click counts and user data
- **Rate limiting**: Prevent abuse

```typescript
class URLShortener {
  private baseUrl = 'https://short.ly/';
  private counter = 0;
  
  shortenUrl(longUrl: string): string {
    const shortCode = this.encode(++this.counter);
    
    // Store in database
    this.database.store(shortCode, longUrl);
    
    return this.baseUrl + shortCode;
  }
  
  private encode(num: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    while (num > 0) {
      result = chars[num % 62] + result;
      num = Math.floor(num / 62);
    }
    
    return result || 'a';
  }
}
```

**Q2: How would you design a chat application?**
**A:** Architecture:
- **WebSocket servers** for real-time communication
- **Message queue** for reliability
- **Database** for message persistence
- **Presence service** for online status
- **File upload service** for media sharing

**Q3: Design a basic caching system**
**A:** Components:
- **Cache levels**: Memory → Redis → Database
- **Eviction policies**: LRU, LFU, TTL-based
- **Cache invalidation**: Write-through, write-behind, cache-aside
- **Consistency**: Eventual consistency for distributed caches

```typescript
// LRU Cache implementation
class LRUCache<T> {
  private capacity: number;
  private cache = new Map<string, T>();
  
  constructor(capacity: number) {
    this.capacity = capacity;
  }
  
  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

**Q4: How do you handle database scaling?**
**A:** Strategies:
- **Vertical scaling**: Add more CPU/RAM/Storage
- **Read replicas**: Scale read operations
- **Sharding**: Partition data across multiple databases
- **Connection pooling**: Manage database connections efficiently

**Q5: Design a simple load balancer**
**A:** 
```typescript
interface Server {
  id: string;
  host: string;
  port: number;
  isHealthy: boolean;
  activeConnections: number;
}

class LoadBalancer {
  private servers: Server[] = [];
  private currentIndex = 0;
  
  addServer(server: Server): void {
    this.servers.push(server);
  }
  
  // Round-robin algorithm
  getNextServer(): Server | null {
    const healthyServers = this.servers.filter(s => s.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }
    
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    return server;
  }
  
  // Least connections algorithm
  getLeastLoadedServer(): Server | null {
    const healthyServers = this.servers.filter(s => s.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }
    
    return healthyServers.reduce((min, server) => 
      server.activeConnections < min.activeConnections ? server : min
    );
  }
}
```

### Intermediate Level

**Q6: Design a social media feed system**
**A:** Components:
- **Timeline generation**: Pull vs Push models
- **Fanout service**: Distribute posts to followers
- **Ranking algorithm**: Sort posts by relevance
- **Caching**: Multi-level caching strategy
- **Content delivery**: CDN for media files

**Q7: Design a distributed cache system**
**A:** Features:
- **Consistent hashing** for data distribution
- **Replication** for fault tolerance
- **LRU eviction** policy
- **Health monitoring** and auto-failover
- **Client-side load balancing**

**Q8: Design a rate limiting system**
**A:** Implementation approaches:

```typescript
// Token bucket rate limiter
class TokenBucketRateLimiter {
  private buckets = new Map<string, TokenBucket>();
  
  isAllowed(clientId: string, tokens: number = 1): boolean {
    if (!this.buckets.has(clientId)) {
      this.buckets.set(clientId, new TokenBucket(100, 10)); // 100 capacity, 10 refill rate
    }
    
    const bucket = this.buckets.get(clientId)!;
    return bucket.consume(tokens);
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  consume(tokens: number): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const timeDiff = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeDiff * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}
```

**Q9: How would you design a notification system?**
**A:** Architecture:
- **Multiple channels**: Email, SMS, Push, In-app
- **Priority queues**: High/medium/low priority notifications
- **Template engine**: Personalized notification content
- **Retry mechanism**: Handle failed deliveries
- **User preferences**: Subscription management

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  priority: 'high' | 'medium' | 'low';
  content: {
    title: string;
    body: string;
    metadata?: any;
  };
  scheduledAt?: Date;
  retryCount: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

class NotificationService {
  private emailQueue = new PriorityQueue<Notification>();
  private smsQueue = new PriorityQueue<Notification>();
  private pushQueue = new PriorityQueue<Notification>();
  
  async sendNotification(notification: Notification): Promise<void> {
    // Check user preferences
    const userPrefs = await this.getUserPreferences(notification.userId);
    if (!userPrefs.allowsType(notification.type)) {
      return;
    }
    
    // Add to appropriate queue
    switch (notification.type) {
      case 'email':
        this.emailQueue.enqueue(notification, this.getPriority(notification.priority));
        break;
      case 'sms':
        this.smsQueue.enqueue(notification, this.getPriority(notification.priority));
        break;
      case 'push':
        this.pushQueue.enqueue(notification, this.getPriority(notification.priority));
        break;
    }
  }
  
  private getPriority(level: string): number {
    switch (level) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 2;
    }
  }
}
```

**Q10: Design a search system like Elasticsearch**
**A:** Components:
- **Indexing pipeline**: Document processing and tokenization
- **Inverted index**: Fast text search capabilities
- **Sharding**: Distribute index across nodes
- **Relevance scoring**: TF-IDF, BM25 algorithms
- **Real-time updates**: Handle document changes

```typescript
// Simplified search index
class SearchIndex {
  private invertedIndex = new Map<string, Set<string>>();
  private documents = new Map<string, any>();
  
  addDocument(id: string, document: any): void {
    this.documents.set(id, document);
    
    // Tokenize and index
    const text = this.extractText(document);
    const tokens = this.tokenize(text);
    
    tokens.forEach(token => {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(id);
    });
  }
  
  search(query: string): string[] {
    const tokens = this.tokenize(query);
    const candidateDocuments = new Map<string, number>();
    
    tokens.forEach(token => {
      const documentIds = this.invertedIndex.get(token);
      if (documentIds) {
        documentIds.forEach(docId => {
          candidateDocuments.set(docId, (candidateDocuments.get(docId) || 0) + 1);
        });
      }
    });
    
    // Sort by relevance score (simple term frequency)
    return Array.from(candidateDocuments.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId]) => docId);
  }
  
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }
  
  private extractText(document: any): string {
    // Extract searchable text from document
    return Object.values(document).join(' ');
  }
}
```

### Advanced Level

**Q11: Design a payment processing system**
**A:** Requirements:
- **ACID transactions** for consistency
- **Idempotency** for retry safety
- **Fraud detection** in real-time
- **PCI compliance** for security
- **Multi-currency** support
- **Audit logging** for compliance

**Q12: Design a global content delivery network (CDN)**
**A:** Components:
- **Edge servers** in multiple regions
- **Origin servers** for source content
- **Routing algorithm** for nearest server
- **Cache invalidation** strategy
- **Real-time monitoring** and alerting

**Q13: Design a distributed database system**
**A:** Architecture:

```typescript
// Distributed database with sharding
class DistributedDatabase {
  private shards: DatabaseShard[];
  private replicationFactor: number;
  
  constructor(shards: DatabaseShard[], replicationFactor = 3) {
    this.shards = shards;
    this.replicationFactor = replicationFactor;
  }
  
  async write(key: string, value: any): Promise<void> {
    const primaryShard = this.getShardForKey(key);
    const replicaShards = this.getReplicaShards(primaryShard);
    
    // Write to primary
    await primaryShard.write(key, value);
    
    // Async replication to replicas
    const replicationPromises = replicaShards.map(shard => 
      shard.write(key, value).catch(err => 
        console.error('Replication failed:', err)
      )
    );
    
    // Don't wait for replicas (eventual consistency)
    Promise.all(replicationPromises);
  }
  
  async read(key: string): Promise<any> {
    const primaryShard = this.getShardForKey(key);
    
    try {
      return await primaryShard.read(key);
    } catch (error) {
      // Fallback to replica
      const replicaShards = this.getReplicaShards(primaryShard);
      for (const replica of replicaShards) {
        try {
          return await replica.read(key);
        } catch (replicaError) {
          continue;
        }
      }
      throw new Error('Data not available');
    }
  }
  
  private getShardForKey(key: string): DatabaseShard {
    const hash = this.hashKey(key);
    const shardIndex = hash % this.shards.length;
    return this.shards[shardIndex];
  }
  
  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }
  
  private getReplicaShards(primaryShard: DatabaseShard): DatabaseShard[] {
    const primaryIndex = this.shards.indexOf(primaryShard);
    const replicas: DatabaseShard[] = [];
    
    for (let i = 1; i < this.replicationFactor; i++) {
      const replicaIndex = (primaryIndex + i) % this.shards.length;
      replicas.push(this.shards[replicaIndex]);
    }
    
    return replicas;
  }
}

interface DatabaseShard {
  id: string;
  write(key: string, value: any): Promise<void>;
  read(key: string): Promise<any>;
  isHealthy(): boolean;
}
```

**Q14: Design a real-time analytics system**
**A:** Components:

```typescript
// Stream processing for real-time analytics
class RealTimeAnalytics {
  private eventStreams = new Map<string, EventStream>();
  private aggregators = new Map<string, Aggregator>();
  private alertRules: AlertRule[] = [];
  
  processEvent(event: AnalyticsEvent): void {
    // Route to appropriate stream
    const streamId = this.getStreamId(event);
    
    if (!this.eventStreams.has(streamId)) {
      this.eventStreams.set(streamId, new EventStream(streamId));
    }
    
    const stream = this.eventStreams.get(streamId)!;
    stream.addEvent(event);
    
    // Update aggregations
    this.updateAggregations(event);
    
    // Check alert rules
    this.checkAlerts(event);
  }
  
  private updateAggregations(event: AnalyticsEvent): void {
    const aggregatorKey = `${event.type}_${event.userId}`;
    
    if (!this.aggregators.has(aggregatorKey)) {
      this.aggregators.set(aggregatorKey, new Aggregator());
    }
    
    const aggregator = this.aggregators.get(aggregatorKey)!;
    aggregator.process(event);
  }
  
  private checkAlerts(event: AnalyticsEvent): void {
    this.alertRules.forEach(rule => {
      if (rule.matches(event)) {
        this.triggerAlert(rule, event);
      }
    });
  }
  
  getMetrics(timeWindow: TimeWindow): MetricsSnapshot {
    const metrics = new Map<string, number>();
    
    this.aggregators.forEach((aggregator, key) => {
      const value = aggregator.getValue(timeWindow);
      metrics.set(key, value);
    });
    
    return new MetricsSnapshot(metrics, timeWindow);
  }
}

interface AnalyticsEvent {
  id: string;
  type: string;
  userId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

class EventStream {
  private events: AnalyticsEvent[] = [];
  private windowSize = 1000; // Keep last 1000 events
  
  constructor(public id: string) {}
  
  addEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    
    // Maintain window size
    if (this.events.length > this.windowSize) {
      this.events.shift();
    }
  }
  
  getEvents(timeWindow: TimeWindow): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= timeWindow.start && 
      event.timestamp <= timeWindow.end
    );
  }
}
```

**Q15: Design a microservices communication system**
**A:** Patterns:

```typescript
// Service mesh with circuit breaker
class ServiceMesh {
  private services = new Map<string, ServiceNode>();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  registerService(name: string, instance: ServiceNode): void {
    this.services.set(name, instance);
    this.circuitBreakers.set(name, new CircuitBreaker({
      failureThreshold: 5,
      timeout: 60000,
      resetTimeout: 30000
    }));
  }
  
  async callService<T>(
    serviceName: string, 
    method: string, 
    payload: any
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (!circuitBreaker) {
      throw new Error(`Service ${serviceName} not found`);
    }
    
    return circuitBreaker.execute(async () => {
      const service = this.services.get(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not available`);
      }
      
      const timeout = setTimeout(() => {
        throw new Error('Service call timeout');
      }, 5000);
      
      try {
        const result = await service.call(method, payload);
        clearTimeout(timeout);
        return result;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    });
  }
}

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(private config: {
    failureThreshold: number;
    timeout: number;
    resetTimeout: number;
  }) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

**Q16: Design a distributed lock system**
**A:**

```typescript
// Redis-based distributed lock
class DistributedLock {
  private redis: any; // Redis client
  private lockScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  constructor(redisClient: any) {
    this.redis = redisClient;
  }
  
  async acquire(
    lockKey: string, 
    ttl: number = 30000, 
    timeout: number = 10000
  ): Promise<string | null> {
    const lockValue = `${Date.now()}_${Math.random().toString(36)}`;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await this.redis.set(
        lockKey,
        lockValue,
        'PX',
        ttl,
        'NX'
      );
      
      if (result === 'OK') {
        return lockValue;
      }
      
      // Wait before retry
      await this.sleep(100);
    }
    
    return null;
  }
  
  async release(lockKey: string, lockValue: string): Promise<boolean> {
    const result = await this.redis.eval(
      this.lockScript,
      1,
      lockKey,
      lockValue
    );
    
    return result === 1;
  }
  
  async withLock<T>(
    lockKey: string,
    operation: () => Promise<T>,
    ttl: number = 30000
  ): Promise<T> {
    const lockValue = await this.acquire(lockKey, ttl);
    
    if (!lockValue) {
      throw new Error('Failed to acquire lock');
    }
    
    try {
      return await operation();
    } finally {
      await this.release(lockKey, lockValue);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
const distributedLock = new DistributedLock(redisClient);

// Critical section execution
await distributedLock.withLock('user:123:update', async () => {
  const user = await database.getUser('123');
  user.balance += 100;
  await database.updateUser(user);
});
```

**Q17: Design a time-series database**
**A:**

```typescript
// Time-series database for metrics
class TimeSeriesDB {
  private dataPoints = new Map<string, DataPoint[]>();
  private indexes = new Map<string, TimeIndex>();
  
  write(metric: string, value: number, timestamp: Date = new Date()): void {
    if (!this.dataPoints.has(metric)) {
      this.dataPoints.set(metric, []);
      this.indexes.set(metric, new TimeIndex());
    }
    
    const dataPoint = new DataPoint(timestamp, value);
    const points = this.dataPoints.get(metric)!;
    const index = this.indexes.get(metric)!;
    
    // Insert in chronological order
    const insertIndex = this.findInsertIndex(points, timestamp);
    points.splice(insertIndex, 0, dataPoint);
    
    // Update index
    index.addPoint(dataPoint, insertIndex);
    
    // Retention policy (keep last 30 days)
    this.applyRetentionPolicy(metric);
  }
  
  query(
    metric: string,
    startTime: Date,
    endTime: Date,
    aggregation?: 'sum' | 'avg' | 'max' | 'min'
  ): QueryResult {
    const points = this.dataPoints.get(metric);
    if (!points) {
      return new QueryResult([], 0);
    }
    
    // Use index for efficient range query
    const index = this.indexes.get(metric)!;
    const relevantPoints = index.getPointsInRange(startTime, endTime);
    
    if (!aggregation) {
      return new QueryResult(relevantPoints, relevantPoints.length);
    }
    
    const aggregatedValue = this.aggregate(relevantPoints, aggregation);
    return new QueryResult([new DataPoint(endTime, aggregatedValue)], 1);
  }
  
  private aggregate(points: DataPoint[], type: string): number {
    if (points.length === 0) return 0;
    
    switch (type) {
      case 'sum':
        return points.reduce((sum, p) => sum + p.value, 0);
      case 'avg':
        return points.reduce((sum, p) => sum + p.value, 0) / points.length;
      case 'max':
        return Math.max(...points.map(p => p.value));
      case 'min':
        return Math.min(...points.map(p => p.value));
      default:
        return 0;
    }
  }
  
  private findInsertIndex(points: DataPoint[], timestamp: Date): number {
    let left = 0;
    let right = points.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (points[mid].timestamp <= timestamp) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }
  
  private applyRetentionPolicy(metric: string): void {
    const points = this.dataPoints.get(metric)!;
    const retentionTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    while (points.length > 0 && points[0].timestamp < retentionTime) {
      points.shift();
    }
  }
}

class DataPoint {
  constructor(
    public timestamp: Date,
    public value: number
  ) {}
}

class TimeIndex {
  private timeToIndex = new Map<number, number>();
  
  addPoint(point: DataPoint, index: number): void {
    const timeKey = this.getTimeKey(point.timestamp);
    this.timeToIndex.set(timeKey, index);
  }
  
  getPointsInRange(start: Date, end: Date): DataPoint[] {
    // Simplified implementation
    // In practice, would use more sophisticated indexing like B+ trees
    return [];
  }
  
  private getTimeKey(timestamp: Date): number {
    return Math.floor(timestamp.getTime() / 1000); // Second precision
  }
}

class QueryResult {
  constructor(
    public dataPoints: DataPoint[],
    public count: number
  ) {}
}
```

This comprehensive guide covers essential system design concepts with practical implementations and real-world examples perfect for technical interviews. 