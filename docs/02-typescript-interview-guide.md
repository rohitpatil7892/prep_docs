# 🟦 TypeScript Complete Interview Guide

## Table of Contents
1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [Advanced Types](#advanced-types)
3. [Object-Oriented Programming](#object-oriented-programming)
4. [TypeScript with Node.js](#typescript-with-nodejs)
5. [Best Practices](#best-practices)
6. [Interview Questions](#interview-questions)

---

## 🟢 TypeScript Fundamentals

### 1. Basic Types

**Description:** TypeScript adds static typing to JavaScript, providing better development experience and catching errors at compile time.

```typescript
// Primitive types
let name: string = 'Rohit';
let age: number = 25;
let isActive: boolean = true;
let height: number = 5.9;

// Arrays
let hobbies: string[] = ['coding', 'reading', 'gaming'];
let numbers: Array<number> = [1, 2, 3, 4, 5];

// Tuples - fixed length arrays with specific types
let person: [string, number, boolean] = ['Rohit', 25, true];
let coordinate: [number, number] = [10, 20];

// Union types
let id: string | number = 123;
id = 'ABC123'; // Valid

// Literal types
let status: 'pending' | 'approved' | 'rejected' = 'pending';
let direction: 'up' | 'down' | 'left' | 'right' = 'up';

// Any type (avoid when possible)
let data: any = 42;
data = 'hello';
data = true;

// Unknown type (safer than any)
let userInput: unknown = 'hello';
if (typeof userInput === 'string') {
  console.log(userInput.toUpperCase()); // Type guard required
}

// Void and never
function logMessage(): void {
  console.log('This function returns nothing');
}

function throwError(): never {
  throw new Error('This function never returns');
}

// Null and undefined
let nullValue: null = null;
let undefinedValue: undefined = undefined;
let optionalValue: string | undefined = undefined;
```

### 2. Interfaces vs Types

**Interfaces:**
```typescript
interface User {
  readonly id: number;
  name: string;
  email: string;
  age?: number; // Optional property
}

// Interface extension
interface Admin extends User {
  permissions: string[];
  canDelete: boolean;
}

// Interface merging (declaration merging)
interface User {
  lastLogin?: Date;
}

// Function interface
interface CreateUser {
  (userData: Omit<User, 'id'>): Promise<User>;
}

// Index signatures
interface StringDictionary {
  [key: string]: string;
}

interface NumberDictionary {
  [index: number]: string;
}
```

**Type Aliases:**
```typescript
type UserType = {
  readonly id: number;
  name: string;
  email: string;
  age?: number;
};

// Union types
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

// Intersection types
type AdminType = UserType & {
  permissions: string[];
  canDelete: boolean;
};

// Function types
type CreateUserType = (userData: Omit<UserType, 'id'>) => Promise<UserType>;

// Conditional types
type ApiResponse<T> = T extends string ? string : T extends number ? number : never;

// Template literal types
type EventName = `on${Capitalize<string>}`;
type ButtonEvent = `button${'Click' | 'Hover' | 'Focus'}`;
```

### 3. Enums

```typescript
// Numeric enums
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

enum DirectionWithValues {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4
}

// String enums (recommended)
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

// Const enums (inlined at compile time)
const enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// Usage
function movePlayer(direction: Direction): void {
  switch (direction) {
    case Direction.Up:
      console.log('Moving up');
      break;
    case Direction.Down:
      console.log('Moving down');
      break;
    default:
      console.log('Invalid direction');
  }
}

function checkUserPermission(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}
```

---

## 🔥 Advanced Types

### 1. Generics

**Basic Generics:**
```typescript
// Generic functions
function identity<T>(arg: T): T {
  return arg;
}

function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

// Generic constraints
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// Using keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Usage examples
const stringResult = identity<string>('hello');
const numberResult = identity<number>(42);
const firstNumber = getFirstElement([1, 2, 3]);
const swapped = swap(['hello', 42]);

const user = { name: 'Rohit', age: 25, email: 'rohit@example.com' };
const userName = getProperty(user, 'name'); // Type: string
const userAge = getProperty(user, 'age');   // Type: number
```

**Generic Classes:**
```typescript
class Repository<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  findById<K extends keyof T>(key: K, value: T[K]): T | undefined {
    return this.items.find(item => item[key] === value);
  }
  
  getAll(): T[] {
    return [...this.items];
  }
  
  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }
  
  update<K extends keyof T>(key: K, value: T[K], updates: Partial<T>): boolean {
    const item = this.findById(key, value);
    if (item) {
      Object.assign(item, updates);
      return true;
    }
    return false;
  }
}

// Usage
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const productRepo = new Repository<Product>();

productRepo.add({
  id: '1',
  name: 'Laptop',
  price: 999,
  category: 'Electronics'
});

const laptop = productRepo.findById('id', '1');
const electronics = productRepo.filter(p => p.category === 'Electronics');
```

### 2. Utility Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  lastLogin: Date;
}

// Partial - makes all properties optional
type PartialUser = Partial<User>;
// Equivalent to: { id?: string; name?: string; email?: string; ... }

function updateUser(id: string, updates: Partial<User>): User {
  const existingUser = getUser(id);
  return { ...existingUser, ...updates };
}

// Required - makes all properties required
type RequiredUser = Required<User>;

// Pick - selects specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
// Equivalent to: { id: string; name: string; email: string; }

// Omit - excludes specific properties
type CreateUserInput = Omit<User, 'id' | 'lastLogin'>;
// Equivalent to: { name: string; email: string; age: number; isActive: boolean; }

// Record - creates object type with specific keys and value types
type UserRoles = Record<string, string[]>;
// Equivalent to: { [key: string]: string[] }

const rolePermissions: UserRoles = {
  admin: ['read', 'write', 'delete'],
  user: ['read'],
  moderator: ['read', 'write']
};

// Extract and Exclude for union types
type Status = 'loading' | 'success' | 'error' | 'idle';
type ActiveStatus = Extract<Status, 'loading' | 'success'>; // 'loading' | 'success'
type InactiveStatus = Exclude<Status, 'loading' | 'success'>; // 'error' | 'idle'

// ReturnType and Parameters
function createUser(name: string, email: string): { id: string; name: string; email: string } {
  return { id: Date.now().toString(), name, email };
}

type CreateUserReturn = ReturnType<typeof createUser>; // { id: string; name: string; email: string }
type CreateUserParams = Parameters<typeof createUser>; // [string, string]
```

### 3. Advanced Type Patterns

**Mapped Types:**
```typescript
// Custom mapped type
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// Conditional mapped types
type NonNullable<T> = {
  [P in keyof T]: T[P] extends null | undefined ? never : T[P];
};

// Usage
type ReadonlyUser = Readonly<User>;
type OptionalUser = Optional<User>;
type NullableUser = Nullable<User>;
```

**Conditional Types:**
```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type ArrayOfStringOrNumber = ToArray<string | number>; // string[] | number[]

// Inferring types
type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
type StringType = ExtractArrayType<string[]>; // string
type NumberType = ExtractArrayType<number[]>; // number

// Complex conditional type for API responses
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends object
  ? { data: T; status: 'success' }
  : { error: 'Invalid type' };

type StringResponse = ApiResponse<string>; // { message: string }
type ObjectResponse = ApiResponse<User>; // { data: User; status: 'success' }
type ErrorResponse = ApiResponse<number>; // { error: 'Invalid type' }
```

---

## 🏗️ Object-Oriented Programming

### 1. Classes and Inheritance

```typescript
// Abstract base class
abstract class Animal {
  protected name: string;
  protected age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  // Abstract method must be implemented by subclasses
  abstract makeSound(): string;
  
  // Concrete method
  getInfo(): string {
    return `${this.name} is ${this.age} years old`;
  }
  
  // Protected method - accessible in subclasses
  protected sleep(): string {
    return `${this.name} is sleeping`;
  }
}

// Interface for flying animals
interface Flyable {
  fly(): string;
  maxAltitude: number;
}

// Interface for swimming animals
interface Swimmable {
  swim(): string;
  maxDepth: number;
}

// Concrete class implementing abstract class and interfaces
class Bird extends Animal implements Flyable {
  public maxAltitude: number;
  private wingspan: number;
  
  constructor(name: string, age: number, wingspan: number, maxAltitude: number) {
    super(name, age);
    this.wingspan = wingspan;
    this.maxAltitude = maxAltitude;
  }
  
  makeSound(): string {
    return `${this.name} chirps`;
  }
  
  fly(): string {
    return `${this.name} is flying with ${this.wingspan}cm wingspan`;
  }
  
  // Getter and setter
  get wingspanInMeters(): number {
    return this.wingspan / 100;
  }
  
  set wingspanInMeters(meters: number) {
    this.wingspan = meters * 100;
  }
  
  // Static method
  static compareBirds(bird1: Bird, bird2: Bird): string {
    return bird1.wingspan > bird2.wingspan 
      ? `${bird1.name} has larger wingspan` 
      : `${bird2.name} has larger wingspan`;
  }
}

// Multiple interface implementation
class Duck extends Animal implements Flyable, Swimmable {
  public maxAltitude: number = 1000;
  public maxDepth: number = 10;
  
  makeSound(): string {
    return `${this.name} quacks`;
  }
  
  fly(): string {
    return `${this.name} is flying low`;
  }
  
  swim(): string {
    return `${this.name} is swimming gracefully`;
  }
}

// Usage
const eagle = new Bird('Eagle', 5, 200, 3000);
const duck = new Duck('Donald', 3);

console.log(eagle.makeSound()); // Eagle chirps
console.log(eagle.fly()); // Eagle is flying with 200cm wingspan
console.log(eagle.wingspanInMeters); // 2

console.log(duck.makeSound()); // Donald quacks
console.log(duck.fly()); // Donald is flying low
console.log(duck.swim()); // Donald is swimming gracefully
```

### 2. Decorators

```typescript
// Enable experimental decorators in tsconfig.json
// "experimentalDecorators": true,
// "emitDecoratorMetadata": true

// Class decorator
function Logger(constructor: Function) {
  console.log('Class decorator called');
  console.log(constructor);
}

// Method decorator
function LogMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with arguments:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyName} returned:`, result);
    return result;
  };
}

// Property decorator
function Required(target: any, propertyName: string) {
  let value: any;
  
  const getter = () => {
    return value;
  };
  
  const setter = (newValue: any) => {
    if (!newValue) {
      throw new Error(`${propertyName} is required`);
    }
    value = newValue;
  };
  
  Object.defineProperty(target, propertyName, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

// Parameter decorator
function Validate(target: any, propertyName: string, parameterIndex: number) {
  console.log(`Parameter decorator on ${propertyName}, parameter index: ${parameterIndex}`);
}

// Using decorators
@Logger
class UserService {
  @Required
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  @LogMethod
  createUser(@Validate name: string, @Validate email: string): User {
    return {
      id: Date.now().toString(),
      name,
      email,
      age: 0,
      isActive: true,
      lastLogin: new Date()
    };
  }
  
  @LogMethod
  deleteUser(id: string): boolean {
    console.log(`Deleting user with id: ${id}`);
    return true;
  }
}

// Factory decorators
function MinLength(min: number) {
  return function (target: any, propertyName: string) {
    let value: string;
    
    const getter = () => value;
    const setter = (newValue: string) => {
      if (newValue.length < min) {
        throw new Error(`${propertyName} must be at least ${min} characters`);
      }
      value = newValue;
    };
    
    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

class Product {
  @MinLength(3)
  name: string;
  
  @MinLength(10)
  description: string;
  
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
```

---

## 🌐 TypeScript with Node.js

### 1. Express.js with TypeScript

**Setup:**
```bash
npm init -y
npm install express
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Express Application:**
```typescript
// src/types/express.d.ts
import { User } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
}

// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: '', // Would be fetched from database
      createdAt: new Date()
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};

// src/controllers/userController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserDto, UpdateUserDto } from '../types/user';

export class UserController {
  private userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
  getUserById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };
  
  createUser = async (req: Request<{}, {}, CreateUserDto>, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const user = await this.userService.createUser(userData);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create user' });
    }
  };
  
  updateUser = async (req: Request<{ id: string }, {}, UpdateUserDto>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await this.userService.updateUser(id, updates);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ error: 'Failed to update user' });
    }
  };
  
  deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
}

// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UserController } from './controllers/userController';
import { authenticateToken, requireRole } from './middleware/auth';
import { UserRole } from './types/user';

const app = express();
const userController = new UserController();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/users', authenticateToken, userController.getAllUsers);
app.get('/api/users/:id', authenticateToken, userController.getUserById);
app.post('/api/users', authenticateToken, requireRole([UserRole.ADMIN]), userController.createUser);
app.put('/api/users/:id', authenticateToken, requireRole([UserRole.ADMIN]), userController.updateUser);
app.delete('/api/users/:id', authenticateToken, requireRole([UserRole.ADMIN]), userController.deleteUser);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Database Integration with TypeScript

**MongoDB with Mongoose:**
```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/user';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, createdAt: -1 });

// Virtual properties
userSchema.virtual('fullInfo').get(function(this: IUser) {
  return `${this.name} (${this.email}) - ${this.role}`;
});

// Instance methods
userSchema.methods.toPublicJSON = function(this: IUser) {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

export const User = mongoose.model<IUser>('User', userSchema);

// src/repositories/userRepository.ts
import { User, IUser } from '../models/User';
import { CreateUserDto, UpdateUserDto } from '../types/user';

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    return User.find({ isActive: true }).select('-password');
  }
  
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }
  
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }
  
  async create(userData: CreateUserDto): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
  
  async update(id: string, updates: UpdateUserDto): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
  }
  
  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }
  
  async findWithPagination(page: number, limit: number): Promise<{
    users: IUser[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ isActive: true })
    ]);
    
    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  }
}
```

---

## ✅ Best Practices

### 1. Type Safety Best Practices

```typescript
// Use strict TypeScript configuration
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Prefer interfaces over types for object shapes
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

// Use enums for constants
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// Use readonly for immutable data
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly timeoutMs: number;
}

// Use const assertions for literal types
const themes = ['light', 'dark', 'auto'] as const;
type Theme = typeof themes[number]; // 'light' | 'dark' | 'auto'

// Type guards for runtime type checking
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}

// Usage
function processUserData(data: unknown): User | null {
  if (isUser(data)) {
    return data; // TypeScript knows this is User
  }
  return null;
}
```

### 2. Error Handling Patterns

```typescript
// Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

class ApiService {
  async fetchUser(id: string): Promise<Result<User>> {
    try {
      const response = await fetch(`/api/users/${id}`);
      
      if (!response.ok) {
        return {
          success: false,
          error: new Error(`HTTP ${response.status}: ${response.statusText}`)
        };
      }
      
      const user = await response.json();
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Error handling middleware
type ErrorHandler = (error: unknown) => never;

const handleError: ErrorHandler = (error: unknown) => {
  if (error instanceof ValidationError) {
    console.error(`Validation error in field ${error.field}: ${error.message}`);
  } else if (error instanceof NotFoundError) {
    console.error(`Resource not found: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
  
  process.exit(1);
};
```

---

## ❓ Interview Questions & Answers

### Basic Level

**Q1: What are the benefits of using TypeScript over JavaScript?**
**A:** 
- **Static typing**: Catch errors at compile time
- **Better IDE support**: Autocomplete, refactoring, navigation
- **Code documentation**: Types serve as documentation
- **Easier refactoring**: Safe code changes across large codebases
- **Better team collaboration**: Clear contracts between code modules

**Q2: Explain the difference between `interface` and `type` in TypeScript**
**A:**
- **Interface**: Can be extended, merged, better for object shapes
- **Type**: More flexible, supports unions/intersections, computed properties
- **Use interface for**: Object definitions that might be extended
- **Use type for**: Complex type computations, unions, primitives

**Q3: What is the difference between `any`, `unknown`, and `never`?**

**A:**
- **any**: Disables type checking, allows anything (avoid when possible)
- **unknown**: Type-safe alternative to any, requires type checking before use
- **never**: Represents values that never occur (functions that throw or infinite loops)

```typescript
// any - no type safety
let value: any = 42;
value.foo.bar; // No error, but dangerous

// unknown - type safe
let userInput: unknown = 42;
if (typeof userInput === 'string') {
  console.log(userInput.toUpperCase()); // Safe after type guard
}

// never - functions that never return
function throwError(): never {
  throw new Error('Something went wrong');
}

function infiniteLoop(): never {
  while (true) {
    // infinite loop
  }
}
```

**Q4: How do you create optional and readonly properties?**

**A:**
```typescript
interface User {
  readonly id: string;        // Cannot be modified after creation
  name: string;
  email?: string;            // Optional property
  readonly createdAt: Date;
}

const user: User = {
  id: '123',
  name: 'Rohit',
  createdAt: new Date()
};

// user.id = '456'; // Error: Cannot assign to 'id' because it is readonly
user.email = 'rohit@example.com'; // OK - optional property can be set

// Readonly utility type
type ReadonlyUser = Readonly<User>;
```

**Q5: What are type assertions and when should you use them?**

**A:** Type assertions tell TypeScript to treat a value as a specific type:

```typescript
// Angle bracket syntax (not recommended in JSX)
let someValue: unknown = "this is a string";
let strLength: number = (<string>someValue).length;

// 'as' syntax (preferred)
let strLength2: number = (someValue as string).length;

// Common use cases
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const input = document.querySelector('input') as HTMLInputElement;

// Non-null assertion
function processUser(user?: User) {
  // We know user exists at this point
  console.log(user!.name);
}

// Double assertion (use with caution)
const value = 'hello' as unknown as number; // Forces type
```

### Intermediate Level

**Q6: What are generics and why are they useful?**
**A:** Generics allow creating reusable components that work with multiple types while maintaining type safety. Benefits:
- **Type safety**: No loss of type information
- **Reusability**: Same code works with different types
- **Better IntelliSense**: Editor support for generic types

**Q7: Explain utility types: `Partial`, `Required`, `Pick`, `Omit`**
**A:**
- **Partial<T>**: Makes all properties optional
- **Required<T>**: Makes all properties required
- **Pick<T, K>**: Creates type with only specified properties
- **Omit<T, K>**: Creates type excluding specified properties

**Q8: What are mapped types and how do you create them?**

**A:** Mapped types create new types by transforming properties of existing types:

```typescript
// Basic mapped type
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type NullableUser = Nullable<User>;
// Result: { id: string | null; name: string | null; email: string | null; }

// Conditional mapped types
type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

class Example {
  name: string = '';
  age: number = 0;
  getName(): string { return this.name; }
  setAge(age: number): void { this.age = age; }
}

type ExampleData = NonFunctionProperties<Example>;
// Result: { name: string; age: number; }

// Recursive mapped types
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

**Q9: How do you implement function overloading in TypeScript?**

**A:**
```typescript
// Function overloads
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: 'input'): HTMLInputElement;
function createElement(tag: 'canvas'): HTMLCanvasElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// The actual implementation must handle all overloads
const div = createElement('div');     // Type: HTMLDivElement
const input = createElement('input'); // Type: HTMLInputElement

// Method overloading in classes
class Calculator {
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: number[], b: number[]): number[];
  add(a: any, b: any): any {
    if (typeof a === 'number' && typeof b === 'number') {
      return a + b;
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return a + b;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return [...a, ...b];
    }
    throw new Error('Invalid arguments');
  }
}

const calc = new Calculator();
const numResult = calc.add(1, 2);           // number
const strResult = calc.add('a', 'b');       // string
const arrResult = calc.add([1, 2], [3, 4]); // number[]
```

**Q10: What are discriminated unions and how do you use them?**

**A:** Discriminated unions use a common property to distinguish between types:

```typescript
// Discriminated union
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: any;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type State = LoadingState | SuccessState | ErrorState;

// Type guards with discriminated unions
function handleState(state: State) {
  switch (state.status) {
    case 'loading':
      console.log('Loading...');
      break;
    case 'success':
      console.log('Data:', state.data); // TypeScript knows this is SuccessState
      break;
    case 'error':
      console.log('Error:', state.error); // TypeScript knows this is ErrorState
      break;
    default:
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}

// Payment method example
interface CreditCardPayment {
  type: 'credit_card';
  cardNumber: string;
  expiryDate: string;
}

interface PayPalPayment {
  type: 'paypal';
  email: string;
}

interface BankTransferPayment {
  type: 'bank_transfer';
  accountNumber: string;
  routingNumber: string;
}

type Payment = CreditCardPayment | PayPalPayment | BankTransferPayment;

function processPayment(payment: Payment) {
  switch (payment.type) {
    case 'credit_card':
      return `Processing credit card: ${payment.cardNumber}`;
    case 'paypal':
      return `Processing PayPal: ${payment.email}`;
    case 'bank_transfer':
      return `Processing bank transfer: ${payment.accountNumber}`;
  }
}
```

### Advanced Level

**Q11: How do conditional types work in TypeScript?**
**A:** Conditional types use the `extends` keyword to create types based on conditions:
```typescript
type ApiResponse<T> = T extends string ? { message: T } : { data: T };
```

**Q12: What are mapped types and when would you use them?**
**A:** Mapped types transform existing types by iterating over properties:
```typescript
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```
Use for: Creating variations of existing types, transforming properties

**Q13: How do you handle async operations with proper typing?**
**A:** Use Promise<T> for return types, async/await with proper error handling:
```typescript
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

**Q14: How do you create a type-safe event emitter?**

**A:**
```typescript
// Type-safe event emitter
type EventMap = {
  'user:created': { id: string; name: string; email: string };
  'user:updated': { id: string; changes: Partial<User> };
  'user:deleted': { id: string };
  'system:error': { message: string; code: number };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: Array<(data: T[K]) => void> } = {};

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// Usage
const emitter = new TypedEventEmitter<EventMap>();

// Type-safe event listening
emitter.on('user:created', (user) => {
  console.log(`New user: ${user.name} (${user.email})`);
});

emitter.on('system:error', (error) => {
  console.error(`System error ${error.code}: ${error.message}`);
});

// Type-safe event emission
emitter.emit('user:created', {
  id: '123',
  name: 'Rohit',
  email: 'rohit@example.com'
});
```

**Q15: How do you implement a builder pattern with TypeScript?**

**A:**
```typescript
// Builder pattern with type safety
interface UserData {
  name: string;
  email: string;
  age?: number;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

class UserBuilder {
  private userData: Partial<UserData> = {};

  setName(name: string): this {
    this.userData.name = name;
    return this;
  }

  setEmail(email: string): this {
    this.userData.email = email;
    return this;
  }

  setAge(age: number): this {
    this.userData.age = age;
    return this;
  }

  setAddress(street: string, city: string, country: string): this {
    this.userData.address = { street, city, country };
    return this;
  }

  setPreferences(theme: 'light' | 'dark', notifications: boolean): this {
    this.userData.preferences = { theme, notifications };
    return this;
  }

  build(): UserData {
    if (!this.userData.name || !this.userData.email) {
      throw new Error('Name and email are required');
    }
    return this.userData as UserData;
  }
}

// Usage
const user = new UserBuilder()
  .setName('Rohit')
  .setEmail('rohit@example.com')
  .setAge(25)
  .setAddress('123 Main St', 'Mumbai', 'India')
  .setPreferences('dark', true)
  .build();

// Advanced builder with required fields tracking
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

class TypeSafeUserBuilder {
  private userData: Partial<UserData> = {};

  setName(name: string): UserBuilderWithName {
    this.userData.name = name;
    return this as any;
  }

  build(): never {
    throw new Error('Name and email are required');
  }
}

class UserBuilderWithName extends TypeSafeUserBuilder {
  setEmail(email: string): UserBuilderComplete {
    this.userData.email = email;
    return this as any;
  }
}

class UserBuilderComplete extends UserBuilderWithName {
  build(): UserData {
    return this.userData as UserData;
  }
}
```

**Q16: How do you implement deep cloning with TypeScript?**

**A:**
```typescript
// Deep clone with type preservation
type DeepClone<T> = T extends object
  ? T extends Array<infer U>
    ? Array<DeepClone<U>>
    : T extends Date
    ? Date
    : T extends Function
    ? T
    : { [K in keyof T]: DeepClone<T[K]> }
  : T;

function deepClone<T>(obj: T): DeepClone<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj as DeepClone<T>;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as DeepClone<T>;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as DeepClone<T>;
  }

  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as DeepClone<T>;
  }

  return obj as DeepClone<T>;
}

// Usage
interface ComplexObject {
  id: number;
  name: string;
  date: Date;
  nested: {
    values: number[];
    meta: { created: Date };
  };
}

const original: ComplexObject = {
  id: 1,
  name: 'Test',
  date: new Date(),
  nested: {
    values: [1, 2, 3],
    meta: { created: new Date() }
  }
};

const cloned = deepClone(original); // Type is preserved
cloned.nested.values.push(4); // Original remains unchanged
```

**Q17: How do you create a type-safe state management system?**

**A:**
```typescript
// Redux-like state management with TypeScript
type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P };

type UserActions =
  | Action<'USER_LOADING'>
  | Action<'USER_LOADED', { user: User }>
  | Action<'USER_ERROR', { error: string }>
  | Action<'USER_UPDATED', { updates: Partial<User> }>;

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type Reducer<S, A> = (state: S, action: A) => S;

const userReducer: Reducer<UserState, UserActions> = (state, action) => {
  switch (action.type) {
    case 'USER_LOADING':
      return { ...state, loading: true, error: null };
    
    case 'USER_LOADED':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        error: null
      };
    
    case 'USER_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    
    case 'USER_UPDATED':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload.updates } : null
      };
    
    default:
      return state;
  }
};

// Store implementation
class Store<S, A> {
  private state: S;
  private listeners: Array<(state: S) => void> = [];

  constructor(
    private reducer: Reducer<S, A>,
    initialState: S
  ) {
    this.state = initialState;
  }

  getState(): S {
    return this.state;
  }

  dispatch(action: A): void {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: S) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Usage
const store = new Store(userReducer, {
  user: null,
  loading: false,
  error: null
});

store.dispatch({ type: 'USER_LOADING' });
store.dispatch({
  type: 'USER_LOADED',
  payload: { user: { id: '1', name: 'Rohit', email: 'rohit@example.com' } }
});
```

**Q18: How do you implement a type-safe API client?**

**A:**
```typescript
// Type-safe API client
interface ApiEndpoints {
  'GET /users': { response: User[] };
  'GET /users/:id': { params: { id: string }; response: User };
  'POST /users': { body: CreateUserRequest; response: User };
  'PUT /users/:id': { params: { id: string }; body: UpdateUserRequest; response: User };
  'DELETE /users/:id': { params: { id: string }; response: void };
}

type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type ApiMethod = keyof ApiEndpoints;
type ApiConfig<M extends ApiMethod> = ApiEndpoints[M];

class TypeSafeApiClient {
  constructor(private baseUrl: string) {}

  async request<M extends ApiMethod>(
    method: M,
    ...args: ApiConfig<M> extends { params: infer P; body: infer B }
      ? [params: P, body: B]
      : ApiConfig<M> extends { params: infer P }
      ? [params: P]
      : ApiConfig<M> extends { body: infer B }
      ? [body: B]
      : []
  ): Promise<ApiConfig<M> extends { response: infer R } ? R : void> {
    const [params, body] = args as [any, any];
    
    // Build URL with params
    let url = method.split(' ')[1];
    if (params) {
      Object.keys(params).forEach(key => {
        url = url.replace(`:${key}`, params[key]);
      });
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: method.split(' ')[0],
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const api = new TypeSafeApiClient('https://api.example.com');

// Type-safe API calls
const users = await api.request('GET /users'); // Type: User[]
const user = await api.request('GET /users/:id', { id: '123' }); // Type: User
const newUser = await api.request('POST /users', {
  name: 'Rohit',
  email: 'rohit@example.com'
}); // Type: User
```

This comprehensive TypeScript guide covers all essential concepts with practical examples perfect for Node.js development and interview preparation. 