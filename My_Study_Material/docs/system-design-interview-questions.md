# 🏗️ System Design Interview Questions & Concepts

This document is designed to help you, Rohit, prepare for system design interviews. It covers common questions, key concepts, and sample answers to help you structure your responses and deepen your understanding.

---

## 📋 Table of Contents
1. [System Design Fundamentals](#system-design-fundamentals)
2. [Common System Design Questions](#common-system-design-questions)
3. [Key Concepts & Patterns](#key-concepts--patterns)
4. [Sample Answers & Diagrams](#sample-answers--diagrams)
5. [Tips for System Design Interviews](#tips-for-system-design-interviews)

---

## 1. System Design Fundamentals
- What is system design?
- Difference between high-level and low-level design
- Functional vs. non-functional requirements
- Scalability, availability, reliability, consistency, maintainability
- CAP theorem (Consistency, Availability, Partition Tolerance)
- Latency vs. throughput

---

## 2. Common System Design Questions

### Q1: Design a URL Shortener (like bit.ly)
- How would you generate unique short URLs?
- How would you handle collisions?
- How would you scale to billions of URLs?
- How would you handle analytics and redirection speed?

### Q2: Design a Rate Limiter
- What algorithms can be used (Token Bucket, Leaky Bucket, Sliding Window)?
- How would you implement distributed rate limiting?

### Q3: Design a Messaging/Chat System (like WhatsApp)
- How would you handle message delivery and ordering?
- How would you support group chats?
- How would you ensure reliability and message persistence?

### Q4: Design a News Feed System (like Facebook/Twitter)
- How would you aggregate and rank posts?
- How would you handle fan-out (push vs. pull models)?
- How would you scale for millions of users?

### Q5: Design an Online File Storage Service (like Google Drive)
- How would you store and retrieve files efficiently?
- How would you handle file versioning and sharing?
- How would you ensure data durability and backup?

### Q6: Design a Web Crawler
- How would you avoid crawling the same page multiple times?
- How would you scale crawling across many servers?
- How would you handle politeness and rate limits?

### Q7: Design a Distributed Cache
- How would you ensure cache consistency?
- How would you handle cache eviction and expiration?
- How would you scale the cache horizontally?

### Q8: Design a Notification System
- How would you deliver notifications in real-time?
- How would you handle retries and failures?
- How would you support multiple channels (email, SMS, push)?

---

## 3. Key Concepts & Patterns
- Load balancing (round robin, least connections, IP hash)
- Caching (client-side, server-side, CDN, cache invalidation)
- Database sharding and replication
- Consistent hashing
- Message queues and event-driven architecture
- Microservices vs. monoliths
- API gateway and service discovery
- Data partitioning and indexing
- Rate limiting and throttling
- Security (authentication, authorization, encryption)
- Monitoring and alerting

---

## 4. Sample Answers & Diagrams

### Example: URL Shortener (High-Level)
**Components:**
- API server (handles requests)
- Database (stores mappings)
- Cache (for fast lookups)
- Analytics service

**Key Points:**
- Use base62 encoding for short URLs
- Store mapping in a NoSQL DB (e.g., DynamoDB, Cassandra)
- Use Redis/Memcached for caching
- Handle collisions with randomization or sequence
- Analytics via async logging

**Diagram:**
```
Client --> API Server --> Cache --> Database
                        |         |
                        v         v
                   Analytics   Backup
```

### Example: Rate Limiter (Token Bucket)
- Store token count per user in Redis
- Refill tokens at a fixed rate
- Reject requests if no tokens left

---

## 5. Tips for System Design Interviews
- Clarify requirements and constraints before jumping to solutions
- State assumptions and ask clarifying questions
- Start with a high-level design, then drill down
- Use diagrams to communicate architecture
- Discuss trade-offs (scalability, consistency, cost, complexity)
- Consider failure scenarios and recovery
- Think about monitoring, logging, and security
- Practice explaining your design out loud

---

**Good luck, Rohit! Reviewing these questions and concepts will help you feel confident and prepared for your system design interviews.** 