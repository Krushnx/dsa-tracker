import type { Types } from "mongoose";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export type AuthProvider = "credentials" | "google";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemStatus = "TODO" | "ATTEMPTED" | "SOLVED" | "REVISION";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type ActivityType =
  | "PROBLEM_SOLVED"
  | "PROBLEM_ATTEMPTED"
  | "GOAL_CREATED"
  | "GOAL_COMPLETED"
  | "STREAK_MILESTONE";

// ─── Model Interfaces ─────────────────────────────────────────────────────────

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  provider: AuthProvider;
  emailVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblem {
  _id: Types.ObjectId;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: ProblemDifficulty;
  link: string;
  topics: string[];
  acceptanceRate: number;
  premiumOnly: boolean;
  category: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProblem {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  status: ProblemStatus;
  notes: string;
  solutionLink?: string;
  solvedAt?: Date;
  firstAttemptedAt?: Date;
  lastReviewedAt?: Date;
  revisionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  targetProblems: number;
  currentProgress: number;
  startDate: Date;
  targetDate?: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStreak {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastSolvedDate?: Date;
  totalActiveDays: number;
  updatedAt: Date;
}

export interface IActivity {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ActivityType;
  title: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface IUserSettings {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  theme: "dark" | "light" | "system";
  dailyGoal: number;
  timezone: string;
  emailNotifications: boolean;
  pinnedCompanies: string[];
  createdAt: Date;
  updatedAt: Date;
}
