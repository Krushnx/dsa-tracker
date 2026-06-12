# DSA Tracker SaaS

## Technical Requirements Document (TRD)

### Version

v1.0

### Project Type

SaaS Web Application

### Purpose

A platform that allows users to track DSA problem-solving progress, maintain streaks, analyze performance, and manage interview preparation.

---

# 1. Technology Stack

## Frontend

### Framework

* Next.js 15 (App Router)

### Language

* TypeScript

### Styling

* Tailwind CSS

### UI Components

* shadcn/ui

### Charts & Analytics

* Recharts

### State Management

* Zustand

### Form Handling

* React Hook Form
* Zod Validation

### Data Fetching

* Server Components
* Server Actions
* Fetch API

---

## Backend

Backend will be handled inside Next.js.

### API Layer

* Route Handlers
* Server Actions

Reason:

* Faster MVP development
* Single codebase
* Lower hosting costs
* Easier deployment

---

## Database

### Database

MongoDB Atlas

### ODM

Mongoose

Reason:

* Flexible schema
* Fast iteration
* Easy handling of nested topic data
* Good fit for analytics-style documents

---

## Authentication

### Auth Library

NextAuth (Auth.js)

### Providers

* Credentials Login
* Google OAuth

### Session Strategy

JWT

Reason:

* No session table required
* Easy scalability
* Supported by Auth.js

---

# 2. High Level Architecture

Client Browser
↓
Next.js Frontend
↓
Server Actions / API Routes
↓
Business Logic Layer
↓
MongoDB Atlas

---

# 3. Application Modules

## Authentication Module

Features:

* Register
* Login
* Logout
* Google Login
* Forgot Password
* Reset Password

---

## Problem Module

Features:

* View Problems
* Search Problems
* Filter Problems
* Sort Problems
* Mark Status

Statuses:

* SOLVED
* ATTEMPTED
* TODO

---

## Progress Module

Features:

* Track solved count
* Track attempted count
* Track unsolved count
* Difficulty breakdown

---

## Streak Module

Features:

* Daily streak
* Longest streak
* Contribution calendar

---

## Dashboard Module

Features:

* Overview Cards
* Analytics Charts
* Progress Reports

---

## Goal Module

Features:

* Create goals
* Track completion
* Goal statistics

---

# 4. Database Design

## users Collection

```json
{
  "_id": "",
  "name": "",
  "email": "",
  "password": "",
  "image": "",
  "provider": "credentials",
  "createdAt": "",
  "updatedAt": ""
}
```

---

## problems Collection

Imported from CSV

```json
{
  "_id": "",
  "leetcodeId": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "link": "",
  "topics": ["Array", "HashMap"],
  "acceptanceRate": 54.2,
  "premiumOnly": false,
  "category": "",
  "likes": 1000,
  "dislikes": 50
}
```

---

## userProblems Collection

```json
{
  "_id": "",
  "userId": "",
  "problemId": "",
  "status": "SOLVED",
  "notes": "",
  "solvedAt": "",
  "updatedAt": ""
}
```

---

## goals Collection

```json
{
  "_id": "",
  "userId": "",
  "target": 300,
  "currentProgress": 125,
  "createdAt": ""
}
```

---

## streaks Collection

```json
{
  "_id": "",
  "userId": "",
  "currentStreak": 12,
  "longestStreak": 20,
  "lastSolvedDate": ""
}
```

---

# 5. API Design

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/session

---

## Problems

GET /api/problems

GET /api/problems/:id

GET /api/problems/search

GET /api/problems/filter

---

## User Progress

POST /api/user/problems

PATCH /api/user/problems/:id

GET /api/user/problems

---

## Dashboard

GET /api/dashboard

Returns:

* totalSolved
* currentStreak
* longestStreak
* easySolved
* mediumSolved
* hardSolved

---

## Goals

POST /api/goals

GET /api/goals

PATCH /api/goals/:id

DELETE /api/goals/:id

---

# 6. Folder Structure

```bash
app/
│
├── (auth)/
├── dashboard/
├── problems/
├── goals/
├── profile/
│
├── api/
│   ├── auth/
│   ├── problems/
│   ├── dashboard/
│   └── goals/
│
├── layout.tsx
└── page.tsx

components/
│
├── ui/
├── dashboard/
├── problems/
├── shared/

lib/
│
├── db/
├── auth/
├── actions/
├── validations/
├── services/

models/
│
├── User.ts
├── Problem.ts
├── UserProblem.ts
├── Goal.ts
└── Streak.ts

hooks/

types/

constants/

public/
```

---

# 7. Performance Requirements

### Page Load

Target:
< 2 seconds

### API Response

Target:
< 300 ms

### Dashboard

Target:
< 1 second

---

# 8. Security Requirements

## Authentication

* Password hashing using bcrypt
* JWT signing
* Secure cookies
* HTTP Only cookies

---

## API Security

* Input validation using Zod
* Rate limiting
* Request sanitization

---

## Database Security

* MongoDB Atlas IP restrictions
* Environment variables
* No secrets in codebase

---

## Authorization

Users can only access:

* Their own profile
* Their own goals
* Their own progress

---

# 9. Deployment

## Frontend + Backend

Vercel

---

## Database

MongoDB Atlas

---

## CI/CD

GitHub Actions

Pipeline:

Push
↓
Lint
↓
Type Check
↓
Build
↓
Deploy

---

# 10. Future Scalability

Phase 2

* LeetCode Sync
* Contest Tracking
* AI Recommendations
* Revision Planner
* Public Profiles
* Leaderboards

Phase 3

* Team Plans
* College Dashboards
* Coding Bootcamp Analytics
* Premium Subscription System

---

# Key Technical Decisions

1. Next.js Full Stack instead of separate backend

   * Faster MVP
   * Reduced complexity

2. MongoDB instead of PostgreSQL

   * Flexible schema
   * Easier iteration during early-stage development

3. Auth.js for Authentication

   * Industry standard
   * Supports Google OAuth

4. Server Actions over excessive REST APIs

   * Better performance
   * Cleaner architecture

5. Vercel + Atlas

   * Lowest operational overhead
   * Easy scaling for first 10k+ users
