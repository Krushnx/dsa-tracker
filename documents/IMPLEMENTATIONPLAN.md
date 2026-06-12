# DSA Tracker SaaS

## Step-by-Step Implementation Plan

### Tech Stack

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* MongoDB Atlas
* Mongoose
* Auth.js (NextAuth)
* Zustand
* Recharts
* Vercel

---

# Phase 0 — Project Planning

## Goals

Finalize MVP scope.

### Deliverables

* PRD
* Technical Requirements Document
* Database Schema
* UI/UX Design Brief
* App Flow Document

### Success Criteria

Entire application scope documented before coding begins.

---

# Phase 1 — Project Setup

## Tasks

Create Next.js project.

Install:

```bash
npx create-next-app@latest
```

Enable:

* TypeScript
* Tailwind
* App Router

Install dependencies:

```bash
npm install mongoose
npm install next-auth
npm install bcryptjs
npm install zod
npm install react-hook-form
npm install zustand
npm install recharts
npm install sonner
```

Setup:

```text
app/
components/
lib/
models/
hooks/
types/
constants/
```

Configure:

* ESLint
* Prettier
* Path aliases

### Deliverables

* Clean project structure
* Git repository
* Initial deployment working

### Success Criteria

Project runs locally and on Vercel.

---

# Phase 2 — Database Foundation

## Tasks

Setup MongoDB Atlas.

Create:

* db connection utility
* environment variables

Create Mongoose Models:

* User
* Problem
* UserProblem
* Goal
* Streak
* Activity
* UserSettings

Implement:

```ts
connectDB()
```

Create indexes.

### Deliverables

* Database connected
* Models created
* Atlas configured

### Success Criteria

Can create/read documents.

---

# Phase 3 — Authentication System

## Tasks

Configure Auth.js.

Implement:

### Credentials Login

* Signup
* Login
* Logout

### Security

* bcrypt hashing
* JWT sessions

### Route Protection

Protect:

```text
/dashboard
/problems
/progress
/goals
/profile
```

### Deliverables

* Working authentication
* Protected routes

### Success Criteria

User can register and login.

---

# Phase 4 — CSV Import System

## Tasks

Build import script.

Read:

```text
leetcode_problems.csv
```

Insert into:

```text
problems collection
```

Generate:

```text
slug
```

Create admin-only script:

```bash
npm run seed
```

### Deliverables

* Entire problem dataset imported

### Success Criteria

Problems available in database.

---

# Phase 5 — Design System

## Tasks

Setup:

* shadcn/ui
* Theme Provider

Build reusable components:

### Components

* Button
* Input
* Modal
* Card
* Badge
* Table
* Pagination
* Sidebar
* Navbar
* Empty State
* Loading Skeleton

### Deliverables

Reusable UI kit.

### Success Criteria

No duplicated UI code.

---

# Phase 6 — Landing Page

## Tasks

Create:

```text
/
```

Sections:

* Hero
* Features
* Analytics Preview
* CTA

Pages:

```text
/login
/signup
```

### Deliverables

Public website.

### Success Criteria

User can register.

---

# Phase 7 — Dashboard

## Tasks

Create:

```text
/dashboard
```

Build:

### Statistics Cards

* Total Solved
* Current Streak
* Longest Streak
* Goal Progress

### Activity Feed

### Contribution Calendar

### Difficulty Breakdown

### Recommended Problems

### Deliverables

Dashboard complete.

### Success Criteria

User sees meaningful analytics.

---

# Phase 8 — Problems Module

## Tasks

Create:

```text
/problems
```

Features:

### Search

By:

* Title
* ID

### Filters

* Difficulty
* Topic
* Category
* Status

### Pagination

### Problem Detail Page

```text
/problems/[id]
```

### Deliverables

Problem explorer.

### Success Criteria

User can browse all problems.

---

# Phase 9 — Progress Tracking

## Tasks

Implement:

### Statuses

* TODO
* ATTEMPTED
* SOLVED

Buttons:

* Mark Solved
* Mark Attempted
* Mark Todo

Update:

```text
userProblems
```

collection.

### Deliverables

Problem tracking system.

### Success Criteria

User progress persists.

---

# Phase 10 — Streak Engine

## Tasks

Build streak calculation service.

Rules:

### Solved Today

Continue streak.

### Missed Day

Reset streak.

Update:

```text
streaks collection
```

### Deliverables

Working streak system.

### Success Criteria

Dashboard streak updates correctly.

---

# Phase 11 — My Progress Page

## Tasks

Create:

```text
/progress
```

Tabs:

* Solved
* Attempted
* Todo

Add:

* Sorting
* Filtering

### Deliverables

Personal tracking page.

### Success Criteria

User can review history.

---

# Phase 12 — Goals Module

## Tasks

Create:

```text
/goals
```

Features:

* Create Goal
* Edit Goal
* Delete Goal

Display:

* Progress
* Completion %

### Deliverables

Goal system.

### Success Criteria

Goals update automatically.

---

# Phase 13 — Notes System

## Tasks

Allow notes on problems.

Store:

```text
userProblems.notes
```

Features:

* Add Notes
* Edit Notes
* Save Notes

### Deliverables

Problem notes.

### Success Criteria

Notes persist.

---

# Phase 14 — Analytics

## Tasks

Build aggregation queries.

Charts:

### Problems Solved

* Daily
* Weekly
* Monthly

### Difficulty Distribution

### Topic Distribution

### Deliverables

Analytics dashboard.

### Success Criteria

Meaningful visual insights.

---

# Phase 15 — Collections Feature (Highly Recommended)

## Tasks

Create:

```text
/collections
```

Collections:

* Blind 75
* NeetCode 150
* Striver SDE Sheet

Track completion per collection.

### Deliverables

Structured learning paths.

### Success Criteria

Users can follow curated lists.

---

# Phase 16 — Mobile Optimization

## Tasks

Responsive layouts.

Create:

* Mobile sidebar
* Bottom navigation

Optimize:

* Tables
* Filters
* Dashboard cards

### Deliverables

Mobile-friendly app.

### Success Criteria

Works on all screen sizes.

---

# Phase 17 — Testing

## Tasks

Manual Testing

Test:

### Authentication

### Dashboard

### Problem Tracking

### Goals

### Streaks

### Mobile

### Deliverables

Bug-free MVP.

### Success Criteria

All critical flows work.

---

# Phase 18 — Deployment

## Tasks

Deploy:

Frontend + Backend

→ Vercel

Database

→ MongoDB Atlas

Setup:

* Production ENV
* Domain
* Analytics

### Deliverables

Live application.

### Success Criteria

Publicly accessible SaaS.

---

# Phase 19 — Final Polish

## Tasks

Add:

### Loading States

### Skeletons

### Empty States

### Error Pages

### Toast Notifications

### SEO

### Metadata

### Deliverables

Production-ready UX.

### Success Criteria

Feels polished and professional.

---

# Phase 20 — Post-MVP Features

## V2

* Google Login
* Public Profiles
* Leaderboards
* Revision Planner
* Achievement System
* Email Notifications

---

## V3

* LeetCode Sync
* Contest Tracking
* AI Recommendations
* Team Plans
* Paid Subscriptions

---

# Recommended Development Order

1. Setup
2. Database
3. Authentication
4. Seed Problems
5. Design System
6. Dashboard
7. Problems Module
8. Progress Tracking
9. Streak System
10. Goals
11. Analytics
12. Collections
13. Mobile Optimization
14. Testing
15. Deployment

This order gets a usable MVP live in the shortest time while building the foundation for future SaaS features.
