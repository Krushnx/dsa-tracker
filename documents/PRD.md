# Product Requirements Document (PRD)

# DSA Tracker

Version: 1.0 (MVP)

Author: Product Team

Status: Draft

---

# 1. Product Overview

DSA Tracker is a web-based platform that helps developers systematically track their Data Structures & Algorithms (DSA) practice journey.

The platform provides a centralized workspace where users can browse coding problems, mark their solving status, maintain consistency through streaks, track topic mastery, and analyze progress through visual dashboards.

The primary goal is to help users stay accountable, motivated, and organized during interview preparation.

Long-term, DSA Tracker aims to become the "GitHub for Interview Preparation" by serving as a complete preparation hub for coding interviews.

---

# 2. Vision Statement

Help developers build a consistent interview-preparation habit by providing the simplest and most motivating way to track coding practice.

---

# 3. Problem Statement

Developers preparing for technical interviews often solve hundreds of DSA problems across platforms such as LeetCode.

However, most users struggle with:

* Tracking overall progress
* Measuring consistency
* Knowing which topics need improvement
* Identifying weak areas
* Revisiting previously solved problems
* Staying motivated over long preparation periods

Current solutions include:

* Excel sheets
* Notion databases
* Personal notes
* Manual tracking

These solutions require continuous maintenance and offer limited insights.

As a result, users lose visibility into their preparation progress and often abandon their tracking systems.

---

# 4. Goals

## Business Goals

* Build a useful developer productivity product
* Establish a foundation for future premium features
* Increase user retention through habit-building mechanisms
* Create a scalable problem-tracking platform

## User Goals

* Track solved problems efficiently
* Build daily consistency
* Maintain solving streaks
* Analyze preparation progress
* Identify weak topics
* Reach interview preparation goals

---

# 5. Target Audience

## Primary Users

### Students

Preparing for internships and campus placements.

### Job Seekers

Preparing for software engineering interviews.

### Software Engineers

Practicing DSA for job switching and career growth.

---

## Secondary Users

### Competitive Programmers

Wanting a structured problem-tracking system.

### Mentors and Trainers

Tracking progress of students.

---

# 6. User Personas

## Persona 1: Final Year Student

Age: 21

Goal:
Secure placement in a product company.

Pain Points:

* Doesn't know preparation progress
* Misses daily practice
* Revisits same problems repeatedly

Success Metric:

* Maintain consistency for 90+ days.

---

## Persona 2: Working Professional

Age: 26

Goal:

Prepare for product-based company interviews.

Pain Points:

* Limited preparation time
* Needs efficient progress tracking

Success Metric:

* Solve 300+ problems before interviews.

---

# 7. Core User Journey

1. User signs up.
2. User browses problem library.
3. User searches/filter problems.
4. User marks problem status.
5. Progress updates automatically.
6. Daily activity contributes to streak.
7. Dashboard visualizes growth.
8. User sets goals.
9. User returns daily to maintain streak.

---

# 8. MVP Scope

## Included in MVP

### Authentication

Features:

* Sign Up
* Login
* Logout
* Forgot Password
* Profile Management

---

### Problem Library

Features:

* Browse all problems
* Search by title
* Filter by difficulty
* Filter by topic
* View problem details

Problem Details:

* Title
* Difficulty
* Topics
* Acceptance Rate
* LeetCode Link

---

### Progress Tracking

Users can mark problems as:

* Solved
* Attempted
* To Do

Track:

* Date solved
* Date attempted

---

### Dashboard

Metrics:

* Total Problems Solved
* Easy Count
* Medium Count
* Hard Count
* Problems Solved This Week
* Problems Solved This Month
* Goal Progress

---

### Streak System

Track:

* Current Streak
* Longest Streak

Rules:

* Solving at least one problem per day extends streak.
* Missing a day resets streak.

Visual:

* GitHub-style contribution heatmap

---

### Analytics

Charts:

* Problems Solved Over Time
* Difficulty Distribution
* Topic Distribution
* Weekly Activity

---

### Goal Tracking

Users can:

* Set target count
* Track completion percentage

Examples:

* Solve 100 problems
* Solve 300 problems
* Solve 500 problems

---

# 9. Out of Scope (Version 1)

The following features should NOT be built in MVP:

### LeetCode Account Sync

Reason:
Requires integration complexity.

---

### Contest Tracking

Reason:
Low impact for initial users.

---

### Public Profiles

Reason:
Not essential for core value.

---

### Leaderboards

Reason:
Premature gamification.

---

### Friend System

Reason:
Network effects not required initially.

---

### AI Recommendations

Reason:
Can be added after collecting user data.

---

### Revision Planner

Reason:
Complex scheduling logic.

---

### Mobile App

Reason:
Web-first validation is faster.

---

### Notes System

Reason:
Adds unnecessary scope.

---

### Multiple Coding Platforms

Reason:
Focus exclusively on LeetCode dataset first.

---

# 10. Functional Requirements

## FR-1 Authentication

User must be able to:

* Register account
* Login
* Logout
* Update profile

---

## FR-2 Problem Management

System must:

* Store complete LeetCode dataset
* Support search
* Support filters
* Support pagination

---

## FR-3 Progress Tracking

User must:

* Mark status
* Update status
* Remove status

System must save progress history.

---

## FR-4 Dashboard

System must calculate:

* Total solved
* Solved by difficulty
* Solved by topic
* Current streak
* Longest streak

---

## FR-5 Goals

System must:

* Store target goal
* Calculate completion percentage
* Show remaining problems

---

# 11. Non-Functional Requirements

## Performance

* Page load < 2 seconds
* Search response < 500ms

---

## Reliability

* 99.9% uptime target

---

## Scalability

Support:

* 10,000+ users
* 500,000+ progress records

---

## Security

* Password hashing
* Session management
* CSRF protection
* Secure authentication

---

# 12. Database Entities

## User

* id
* name
* email
* password
* createdAt

---

## Problem

* id
* title
* difficulty
* topics
* acceptanceRate
* link
* likes
* dislikes

---

## UserProblem

* id
* userId
* problemId
* status
* solvedAt
* attemptedAt

---

## Goal

* id
* userId
* targetCount
* createdAt

---

# 13. User Stories

## Authentication

As a user, I want to create an account so that my progress is saved.

As a user, I want to log in so that I can access my dashboard.

---

## Problem Tracking

As a user, I want to search for problems so that I can find specific questions quickly.

As a user, I want to mark problems as solved so that I can track progress.

As a user, I want to mark problems for future practice so that I don't forget them.

---

## Analytics

As a user, I want to see my topic-wise progress so that I know my weak areas.

As a user, I want to view my streak so that I stay motivated.

---

## Goals

As a user, I want to set a target so that I can measure preparation progress.

---

# 14. Success Metrics

## Product Metrics

### Activation Rate

Percentage of users who:

* Sign up
* Mark first problem

Target:
70%

---

### Weekly Active Users

Target:
40%+

---

### Retention

Day 30 Retention

Target:
25%

---

### Average Problems Tracked

Target:
50+ problems per active user

---

### Streak Participation

Target:
60% users maintain streak for 7+ days

---

# 15. MVP Launch Criteria

The MVP can launch when:

* Authentication is stable
* Problem library is searchable
* Tracking works reliably
* Dashboard updates correctly
* Streak calculations are accurate
* Goal tracking functions properly

---

# 16. Future Roadmap

## Phase 2

* LeetCode API Sync
* Revision Planner
* Smart Reminders

---

## Phase 3

* AI-Based Recommendations
* Personalized Learning Paths
* Interview Readiness Score

---

## Phase 4

* Public Profiles
* Social Features
* Leaderboards
* Community Challenges

---

# 17. Key Product Principle

"Tracking should take less than 5 seconds."

Users should spend time solving problems, not managing the tracker.
