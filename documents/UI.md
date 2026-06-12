# DSA Tracker SaaS

## UI/UX Design Brief

### Project Name

DSA Tracker

### Product Type

SaaS Web Application

### Target Audience

* Software Engineering Students
* Interview Preparation Candidates
* Working Professionals
* Competitive Programmers
* Coding Bootcamp Students

---

# Design Vision

Create a modern, clean, developer-focused platform that feels like a combination of:

* GitHub
* LeetCode
* Linear
* Notion
* Vercel Dashboard

The product should emphasize:

* Progress
* Consistency
* Motivation
* Achievement
* Focus

Users should feel:

"I am improving every day."

---

# Design Style

## Primary Style

Modern SaaS Dashboard

Characteristics:

* Clean
* Minimal
* Professional
* Data-focused
* Fast to scan

Avoid:

* Excessive gradients
* Gaming aesthetics
* Cartoon illustrations
* Heavy animations

---

# Theme

Default:

Dark Mode

Reason:

Developers spend hours coding and generally prefer dark interfaces.

Support:

* Dark Mode
* Light Mode

Dark Mode should be the default experience.

---

# Visual Inspiration

Reference Products:

* GitHub Contributions
* Vercel Dashboard
* Linear
* Notion
* Stripe Dashboard
* LeetCode

Key inspirations:

GitHub:

* Contribution heatmap

Linear:

* Minimal interface
* Clean spacing

Vercel:

* Dashboard cards
* Analytics views

---

# Color Palette

## Dark Theme

Background

Primary:
#0A0A0A

Secondary:
#111111

Card:
#171717

Border:
#262626

---

Text

Primary:
#FAFAFA

Secondary:
#A1A1AA

Muted:
#71717A

---

Accent Colors

Primary Brand

#3B82F6

Blue is associated with:

* Trust
* Technology
* Productivity

---

Success

#22C55E

Used for:

* Solved problems
* Positive streaks

---

Warning

#F59E0B

Used for:

* Attempted problems

---

Danger

#EF4444

Used for:

* Errors
* Goal misses

---

Difficulty Colors

Easy

#22C55E

Medium

#F59E0B

Hard

#EF4444

These colors should remain consistent across the entire application.

---

# Typography

Font Family

Primary:

Inter

Fallback:

system-ui

Reason:

* Highly readable
* Modern SaaS standard
* Excellent on dashboards

---

Type Scale

H1

36px
700

---

H2

28px
600

---

H3

22px
600

---

Body

14px–16px

---

Small Text

12px

---

Line Height

1.5

---

# Layout System

Desktop

Sidebar + Main Content

Structure

Sidebar

Width:
260px

Main Content

Flexible Width

Max Width:
1600px

Centered

---

Mobile

Bottom Navigation

Tabs:

* Dashboard
* Problems
* Progress
* Goals
* Profile

---

Spacing System

Use 8px Grid

Spacing Examples

4px
8px
16px
24px
32px
48px

Avoid random spacing values.

---

# Component Design

## Buttons

Primary

Background:
Blue

Text:
White

Border Radius:
12px

Height:
40px

---

Secondary

Border Only

Transparent Background

---

Danger

Red Background

For:

* Delete Goal
* Remove Notes

---

# Inputs

Style

Dark Background

Subtle Border

Rounded Corners

12px Radius

Focus State

Blue Border

Blue Glow

---

# Cards

Card Style

Background:
#171717

Border:
1px Solid #262626

Radius:
16px

Padding:
24px

No heavy shadows.

---

# Dashboard Structure

Route

/dashboard

---

Top Section

Greeting

Example:

Good Morning, Krushna 👋

Keep your streak alive today.

---

Statistics Grid

4 Cards

1. Total Solved
2. Current Streak
3. Longest Streak
4. Daily Goal

Desktop:

4 Columns

Tablet:

2 Columns

Mobile:

1 Column

---

Contribution Calendar

Largest dashboard component.

GitHub-style heatmap.

Display:

365 days

Hover:

Show date and solved count.

---

Difficulty Analytics

Three cards

Easy

Medium

Hard

Include:

* Count
* Progress Bar

---

Recent Activity

List View

Example:

Solved:
Two Sum

Solved:
House Robber

---

Recommended Problems

Cards

Show:

* Title
* Difficulty
* Topics

Button:

View Problem

---

# Problems Page

Route

/problems

---

Top Section

Search Bar

Filter Button

Sort Dropdown

---

Problem Table

Columns

Status

ID

Title

Difficulty

Topics

Acceptance Rate

Actions

---

Status Indicators

Solved

Green Check

Attempted

Orange Dot

Todo

Gray Circle

---

Table Behavior

Sticky Header

Pagination

Responsive

---

# Problem Details Page

Layout

Two Column Desktop

Single Column Mobile

---

Left

Problem Information

---

Right

Actions

* Mark Solved
* Mark Attempted
* Mark Todo

---

Notes Section

Rich Text Area

Auto Save Optional

---

# Progress Page

Route

/progress

---

Tabs

Solved

Attempted

Todo

---

Each Tab

Table View

Statistics Header

---

# Goals Page

Route

/goals

---

Goal Cards

Display

Title

Progress

Percentage

Progress Bar

---

Create Goal Button

Floating Action Button

Mobile

Top Right

Desktop

Header Section

---

# Profile Page

Route

/profile

---

Sections

Account

Preferences

Statistics

Security

---

# Empty States

Must be visually appealing.

Example:

No solved problems yet.

Illustration:
Simple line icon

Text:
Start solving your first problem today.

CTA:
Browse Problems

---

# Loading States

Use Skeleton Loaders

Never use spinners for page loads.

Skeletons:

Dashboard Cards

Problem Table

Analytics

---

# Error States

Friendly messages

Example:

Unable to load data.

Button:

Try Again

---

# Mobile Responsiveness

Breakpoints

Mobile:
<768px

Tablet:
768px–1024px

Desktop:

> 1024px

---

Mobile Rules

Collapse Sidebar

Use Bottom Navigation

Stack Cards Vertically

Full Width Tables

Horizontal Scroll For Large Tables

---

# User Experience Principles

1. One-click problem tracking

Users should mark a problem solved within one click.

---

2. Progress First

Always show progress before data.

---

3. Motivation Through Visual Feedback

Every action should provide feedback.

Examples:

* Toasts
* Progress Updates
* Streak Updates

---

4. Minimize Cognitive Load

Avoid clutter.

Show only relevant information.

---

5. Encourage Daily Usage

Dashboard should immediately show:

* Today's Goal
* Current Streak
* Recommended Problems

These three elements should dominate the screen.

---

# Design Goal

The final product should feel like a premium developer productivity tool that users open every day, similar to GitHub, Notion, or Linear, while staying focused on DSA progress tracking and interview preparation.
