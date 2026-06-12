# DSA Tracker SaaS

## Complete User Flow & Screen Specification (MVP)

---

# 1. Global Navigation

After Login:

Sidebar Navigation

* Dashboard
* Problems
* My Progress
* Goals
* Profile

Top Navbar

* Search
* Notifications (Future)
* User Avatar

---

# 2. Public Landing Page

Route:
`/`

Purpose:
Convert visitors into users.

Sections:

1. Hero Section
2. Features
3. Analytics Preview
4. Streak Preview
5. CTA Section

Buttons:

### Get Started

Action:
Navigate to `/signup`

### Login

Action:
Navigate to `/login`

---

# Empty State

None

---

# 3. Signup Page

Route:
`/signup`

Fields:

* Name
* Email
* Password
* Confirm Password

Buttons:

### Create Account

Action:

1. Validate form
2. Create user
3. Auto-login
4. Redirect to onboarding

Success:

Toast:
"Account created successfully"

Redirect:
`/onboarding`

Error:

* Email already exists
* Password mismatch
* Invalid email

---

# 4. Login Page

Route:
`/login`

Fields:

* Email
* Password

Buttons:

### Login

Success:

Redirect:
`/dashboard`

Error:

Invalid credentials

Toast:
"Incorrect email or password"

---

### Continue with Google

Success:

Redirect:
`/dashboard`

---

### Forgot Password

Navigate:
`/forgot-password`

---

# 5. Onboarding Flow

Route:
`/onboarding`

Purpose:

Collect initial preferences.

Fields:

### Daily Goal

Dropdown

* 1 Problem
* 2 Problems
* 3 Problems
* 5 Problems

### Target

Input

Examples:

* 100 Problems
* 300 Problems
* 500 Problems

Button:

### Continue

Action:

Save onboarding data

Redirect:

`/dashboard`

---

# 6. Dashboard

Route:
`/dashboard`

Purpose:

Home screen after login.

Components:

---

## Stats Cards

Display:

* Total Solved
* Current Streak
* Longest Streak
* Daily Goal Progress

---

## Contribution Calendar

GitHub style heatmap

Click Day:

Show problems solved that day

---

## Difficulty Breakdown

Cards:

* Easy
* Medium
* Hard

---

## Recent Activity

Example:

Solved Two Sum

Solved Merge Intervals

Solved House Robber

---

## Recommended Problems

Show:

5 unsolved problems

Buttons:

### View Problem

Navigate:

`/problems/[id]`

---

# Empty State

If user solved 0 problems

Display:

"Start your DSA journey today"

Button:

Browse Problems

---

# 7. Problems Listing Page

Route:
`/problems`

Purpose:

Master problem explorer.

---

## Search Bar

Search by:

* Title
* ID

---

## Filters

Difficulty

* Easy
* Medium
* Hard

Topics

Dynamic list

Category

Dynamic list

Status

* All
* Solved
* Attempted
* Todo

---

## Table Columns

ID

Title

Difficulty

Topics

Acceptance Rate

Status

Actions

---

## Row Actions

### View

Navigate:

`/problems/[id]`

### Mark Solved

Instant update

### Mark Attempted

Instant update

### Mark Todo

Instant update

---

# Empty State

"No problems found"

Button:

Clear Filters

---

# 8. Problem Details Page

Route:
`/problems/[id]`

Purpose:

View detailed problem information.

---

Display

* Title
* Difficulty
* Topics
* Acceptance Rate
* Likes
* Dislikes

---

Buttons

### Open LeetCode

Open external link

New tab

---

### Mark Solved

Action:

Create/Update User Problem

Success:

Toast:
"Problem marked solved"

---

### Mark Attempted

Success:

Toast:
"Problem marked attempted"

---

### Mark Todo

Success:

Toast:
"Added to your todo list"

---

## Notes Section

Textarea

Buttons

### Save Notes

Success:

Toast:
"Notes saved"

---

# Error State

Problem not found

Display:

404 Page

---

# 9. My Progress Page

Route:
`/progress`

Purpose:

Track personal progress.

---

Tabs

### Solved

Display all solved problems

---

### Attempted

Display all attempted problems

---

### Todo

Display all pending problems

---

Each Row

* Title
* Difficulty
* Date

Actions

* View
* Change Status

---

# Empty States

Solved Tab

"No solved problems yet"

Attempted Tab

"No attempted problems"

Todo Tab

"No pending problems"

---

# 10. Goals Page

Route:
`/goals`

Purpose:

Manage coding goals.

---

Display

Goal Card

Example

300 Problems Goal

Progress:

120 / 300

40%

---

Buttons

### Create Goal

Modal

Fields:

* Goal Title
* Target Number

---

### Edit Goal

Update Goal

---

### Delete Goal

Confirmation Modal

---

Success

Toast:
"Goal updated"

---

# Empty State

"No active goals"

Button:

Create Goal

---

# 11. Profile Page

Route:
`/profile`

Purpose:

Manage account.

---

Display

Profile Image

Name

Email

Join Date

---

Buttons

### Edit Profile

Update:

* Name
* Avatar

---

### Change Password

Modal

Fields:

* Current Password
* New Password

---

### Logout

Action:

Destroy session

Redirect:

`/login`

---

# 12. Mobile Navigation

Bottom Navigation

* Dashboard
* Problems
* Progress
* Goals
* Profile

---

# 13. Global Search

Available in Navbar.

Searches:

* Problem Title
* Problem ID

Result Click:

Navigate to problem page.

---

# 14. Toast Notifications

Success:

* Login Successful
* Problem Marked Solved
* Goal Created
* Goal Updated
* Notes Saved

Error:

* Network Error
* Unauthorized
* Validation Failed
* Server Error

---

# 15. Error Pages

404

Message:

"Page not found"

Button:

Go Dashboard

---

500

Message:

"Something went wrong"

Button:

Try Again

---

# 16. Authorization Rules

Guest Users

Allowed:

* Landing Page
* Login
* Signup

Restricted:

* Dashboard
* Problems
* Progress
* Goals
* Profile

Unauthenticated access:

Redirect to Login

---

# Complete Navigation Flow

Landing
↓
Signup/Login
↓
Onboarding
↓
Dashboard
↓
Problems
↓
Problem Details
↓
Mark Solved
↓
Dashboard Updates
↓
Progress Updates
↓
Goal Progress Updates

All pages accessible through sidebar navigation.