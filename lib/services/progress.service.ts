import { connectDB } from "@/lib/db/mongoose";
import { UserProblem, Problem, Streak, Activity, Goal } from "@/models";
import type { ProblemStatus } from "@/types";
import mongoose from "mongoose";

export interface UserProblemItem {
  _id: string;
  problemId: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  status: ProblemStatus;
  solvedAt?: string;
  firstAttemptedAt?: string;
  notes: string;
}

export interface ProgressSummary {
  solved: number;
  attempted: number;
  todo: number;
  revision: number;
}

export async function getUserProgress(
  userId: string,
  statusFilter?: ProblemStatus
): Promise<UserProblemItem[]> {
  await connectDB();

  const query: Record<string, unknown> = { userId };
  if (statusFilter) query.status = statusFilter;

  const userProblems = await UserProblem.find(query)
    .sort({ updatedAt: -1 })
    .lean();

  // Batch fetch problem details
  const problemIds = userProblems.map((up) => up.problemId);
  const problems = await Problem.find({ _id: { $in: problemIds } })
    .select("leetcodeId title slug difficulty topics")
    .lean();

  const problemMap = new Map(problems.map((p) => [p._id.toString(), p]));

  return userProblems
    .map((up) => {
      const p = problemMap.get(up.problemId.toString());
      if (!p) return null;
      return {
        _id: up._id.toString(),
        problemId: up.problemId.toString(),
        leetcodeId: p.leetcodeId,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
        topics: p.topics,
        status: up.status as ProblemStatus,
        solvedAt: up.solvedAt?.toISOString(),
        firstAttemptedAt: up.firstAttemptedAt?.toISOString(),
        notes: up.notes ?? "",
      };
    })
    .filter(Boolean) as UserProblemItem[];
}

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  await connectDB();

  const result = await UserProblem.aggregate([
    { $match: { userId: userId as unknown as mongoose.Types.ObjectId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const map: Record<string, number> = {};
  for (const r of result) map[r._id] = r.count;

  return {
    solved: map["SOLVED"] ?? 0,
    attempted: map["ATTEMPTED"] ?? 0,
    todo: map["TODO"] ?? 0,
    revision: map["REVISION"] ?? 0,
  };
}

/** Update or create a UserProblem record and keep streak + activity in sync */
export async function updateProblemStatus(
  userId: string,
  problemId: string,
  newStatus: ProblemStatus
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  const uid = userId as unknown as mongoose.Types.ObjectId;
  const pid = problemId as unknown as mongoose.Types.ObjectId;
  const now = new Date();

  // Find the problem to get its title
  const problem = await Problem.findById(problemId).lean();
  if (!problem) return { success: false, message: "Problem not found" };

  // Upsert user problem
  const existing = await UserProblem.findOne({ userId: uid, problemId: pid });

  if (existing) {
    existing.status = newStatus;
    if (newStatus === "SOLVED" && !existing.solvedAt) {
      existing.solvedAt = now;
    }
    if (!existing.firstAttemptedAt && newStatus !== "TODO") {
      existing.firstAttemptedAt = now;
    }
    existing.lastReviewedAt = now;
    if (newStatus === "REVISION") existing.revisionCount += 1;
    await existing.save();
  } else {
    await UserProblem.create({
      userId: uid,
      problemId: pid,
      status: newStatus,
      solvedAt: newStatus === "SOLVED" ? now : undefined,
      firstAttemptedAt: newStatus !== "TODO" ? now : undefined,
    });
  }

  // Update streak if solved
  if (newStatus === "SOLVED") {
    await updateStreak(userId);
    await updateGoalProgress(userId);
  }

  // Log activity
  const activityTitle =
    newStatus === "SOLVED"
      ? `Solved: ${problem.title}`
      : newStatus === "ATTEMPTED"
      ? `Attempted: ${problem.title}`
      : `Added to todo: ${problem.title}`;

  const activityType =
    newStatus === "SOLVED"
      ? "PROBLEM_SOLVED"
      : newStatus === "ATTEMPTED"
      ? "PROBLEM_ATTEMPTED"
      : "PROBLEM_SOLVED"; // fallback

  if (newStatus === "SOLVED" || newStatus === "ATTEMPTED") {
    await Activity.create({
      userId: uid,
      type: activityType,
      title: activityTitle,
      metadata: { problemId, difficulty: problem.difficulty },
    });
  }

  return { success: true, message: getSuccessMessage(newStatus) };
}

export async function saveProblemNotes(
  userId: string,
  problemId: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  const uid = userId as unknown as mongoose.Types.ObjectId;
  const pid = problemId as unknown as mongoose.Types.ObjectId;

  await UserProblem.findOneAndUpdate(
    { userId: uid, problemId: pid },
    { $set: { notes, lastReviewedAt: new Date() } },
    { upsert: true, new: true }
  );

  return { success: true, message: "Notes saved" };
}

// ─── Streak Logic ─────────────────────────────────────────────────────────────

async function updateStreak(userId: string) {
  const uid = userId as unknown as mongoose.Types.ObjectId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const streak = await Streak.findOne({ userId: uid });

  if (!streak) {
    await Streak.create({
      userId: uid,
      currentStreak: 1,
      longestStreak: 1,
      lastSolvedDate: today,
      totalActiveDays: 1,
      updatedAt: new Date(),
    });
    return;
  }

  const last = streak.lastSolvedDate
    ? new Date(streak.lastSolvedDate)
    : null;

  if (last) {
    last.setHours(0, 0, 0, 0);

    if (last.getTime() === today.getTime()) {
      // Already solved today — no change needed
      return;
    }

    if (last.getTime() === yesterday.getTime()) {
      // Solved yesterday — extend streak
      streak.currentStreak += 1;
    } else {
      // Missed a day — reset streak
      streak.currentStreak = 1;
    }
  } else {
    streak.currentStreak = 1;
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastSolvedDate = today;
  streak.totalActiveDays += 1;
  streak.updatedAt = new Date();

  await streak.save();

  // Milestone activity
  const milestones = [7, 14, 30, 60, 100];
  if (milestones.includes(streak.currentStreak)) {
    await Activity.create({
      userId: uid,
      type: "STREAK_MILESTONE",
      title: `🔥 ${streak.currentStreak}-day streak!`,
      metadata: { streak: streak.currentStreak },
    });
  }
}

async function updateGoalProgress(userId: string) {
  const uid = userId as unknown as mongoose.Types.ObjectId;
  const totalSolved = await UserProblem.countDocuments({ userId: uid, status: "SOLVED" });

  const goal = await Goal.findOne({ userId: uid, status: "ACTIVE" });
  if (!goal) return;

  goal.currentProgress = totalSolved;
  if (totalSolved >= goal.targetProblems) {
    goal.status = "COMPLETED";
    await Activity.create({
      userId: uid,
      type: "GOAL_COMPLETED",
      title: `🎯 Goal completed: ${goal.title}`,
      metadata: { goalId: goal._id },
    });
  }
  await goal.save();
}

function getSuccessMessage(status: ProblemStatus): string {
  switch (status) {
    case "SOLVED": return "Problem marked as solved!";
    case "ATTEMPTED": return "Problem marked as attempted";
    case "TODO": return "Added to your todo list";
    case "REVISION": return "Marked for revision";
    default: return "Status updated";
  }
}
