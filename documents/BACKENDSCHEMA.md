# DSA Tracker SaaS

# Backend Database Schema Design (MongoDB)

## Database

MongoDB Atlas

## ODM

Mongoose

## Authentication

Auth.js (NextAuth)

## Architecture Principle

The platform is multi-tenant.

Every user owns their own:

* Progress
* Goals
* Notes
* Streaks
* Preferences

The master problem dataset is shared across all users.

---

# Collection Relationships

```text
User
 ├── UserProblem
 ├── Goal
 ├── UserSettings
 ├── Streak
 └── Activity

Problem
 └── UserProblem
```

---

# 1. users Collection

Purpose:
Store user account information.

```ts
{
  _id: ObjectId,

  name: String,

  email: String,

  passwordHash: String,

  image: String,

  provider: String,

  emailVerified: Boolean,

  role: String,

  createdAt: Date,

  updatedAt: Date
}
```

### Indexes

```js
email (unique)
role
```

### Roles

```ts
USER
ADMIN
```

---

# 2. problems Collection

Master problem repository.

Imported once from CSV.

Shared by all users.

```ts
{
  _id: ObjectId,

  leetcodeId: Number,

  title: String,

  slug: String,

  difficulty: String,

  link: String,

  topics: [String],

  acceptanceRate: Number,

  premiumOnly: Boolean,

  category: String,

  likes: Number,

  dislikes: Number,

  createdAt: Date,

  updatedAt: Date
}
```

### Indexes

```js
leetcodeId (unique)

title (text)

difficulty

topics

category
```

---

# 3. userProblems Collection

Most important collection.

Stores user progress.

One document per user/problem pair.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  problemId: ObjectId,

  status: String,

  notes: String,

  solutionLink: String,

  solvedAt: Date,

  firstAttemptedAt: Date,

  lastReviewedAt: Date,

  revisionCount: Number,

  createdAt: Date,

  updatedAt: Date
}
```

### Status Values

```ts
TODO

ATTEMPTED

SOLVED

REVISION
```

### Compound Unique Index

```js
userId + problemId
```

Prevents duplicate tracking.

### Query Indexes

```js
userId

problemId

status

solvedAt
```

---

# 4. goals Collection

Tracks personal targets.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  title: String,

  targetProblems: Number,

  currentProgress: Number,

  startDate: Date,

  targetDate: Date,

  status: String,

  createdAt: Date,

  updatedAt: Date
}
```

### Goal Status

```ts
ACTIVE

COMPLETED

ARCHIVED
```

### Indexes

```js
userId

status
```

---

# 5. streaks Collection

Stores streak calculations.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  currentStreak: Number,

  longestStreak: Number,

  lastSolvedDate: Date,

  totalActiveDays: Number,

  updatedAt: Date
}
```

### Unique Index

```js
userId
```

One streak record per user.

---

# 6. activities Collection

Activity feed.

Used for dashboard.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  type: String,

  title: String,

  metadata: Object,

  createdAt: Date
}
```

### Activity Types

```ts
PROBLEM_SOLVED

PROBLEM_ATTEMPTED

GOAL_CREATED

GOAL_COMPLETED

STREAK_MILESTONE
```

### Indexes

```js
userId

createdAt
```

---

# 7. userSettings Collection

Stores user preferences.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  theme: String,

  dailyGoal: Number,

  timezone: String,

  emailNotifications: Boolean,

  createdAt: Date,

  updatedAt: Date
}
```

### Unique Index

```js
userId
```

---

# 8. accounts Collection (Auth.js)

OAuth provider linkage.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  provider: String,

  providerAccountId: String,

  accessToken: String,

  refreshToken: String,

  expiresAt: Number
}
```

### Indexes

```js
provider + providerAccountId
```

---

# 9. sessions Collection (Optional)

Only if database sessions are used.

Not needed for JWT strategy.

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  sessionToken: String,

  expires: Date
}
```

---

# 10. verificationTokens Collection

Used for:

* Email verification
* Password reset

```ts
{
  _id: ObjectId,

  identifier: String,

  token: String,

  expires: Date
}
```

### Indexes

```js
token (unique)
expires
```

---

# Ownership Rules

## User

Can Read

```text
Own Profile
Own Goals
Own Progress
Own Notes
Own Activities
Own Settings
```

Can Write

```text
Own Goals
Own Progress
Own Notes
Own Settings
```

Cannot Access

```text
Other User Data
```

---

## Admin

Can Read

```text
All Users
All Problems
All Goals
```

Can Write

```text
Problems
User Management
```

---

# Authorization Middleware

Protected Routes

```text
/dashboard
/problems/*
/progress
/goals
/profile
```

Check:

1. Session Exists
2. JWT Valid
3. User Exists

---

# JWT Payload

```ts
{
  id: string,
  email: string,
  role: string
}
```

Never include:

```text
passwordHash
tokens
sensitive data
```

---

# Streak Calculation Logic

When status changes to SOLVED:

1. Check lastSolvedDate

2. If yesterday:

currentStreak += 1

3. If today:

No change

4. Else:

currentStreak = 1

5. Update longestStreak

---

# Dashboard Aggregations

## Total Solved

```js
count(
 status = SOLVED
)
```

---

## Difficulty Breakdown

Aggregate:

```js
userProblems
JOIN problems
GROUP BY difficulty
```

---

## Topic Progress

Aggregate:

```js
userProblems
JOIN problems
GROUP BY topic
```

---

# Recommended MongoDB Indexes

users

```js
email
```

problems

```js
leetcodeId
title
difficulty
topics
```

userProblems

```js
userId
userId + status
userId + problemId
solvedAt
```

goals

```js
userId
status
```

activities

```js
userId
createdAt
```

---

# Data Integrity Rules

Rule 1

One user can track one problem only once.

Enforced by:

```js
unique(userId, problemId)
```

---

Rule 2

Problems collection is immutable.

Users never update problems.

Only admins can.

---

Rule 3

Deleting a user:

Delete:

* Goals
* UserProblems
* Activities
* Settings
* Streak

Keep:

* Problems

---

# Future Collections (V2)

## collections

Blind 75

NeetCode 150

Striver Sheet

Custom Lists

---

## contestHistory

Contest participation data.

---

## subscriptions

Stripe/Razorpay plans.

---

## reminders

Revision notifications.

---

## achievements

Badges and XP system.
