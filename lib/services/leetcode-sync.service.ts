import { connectDB } from "@/lib/db/mongoose";
import { LeetCodeSync, UserProblem, Problem, User } from "@/models";
import type { Types } from "mongoose";
import leetcodeClient from "@/lib/leetcode/leetcode-client";
import type { LeetCodeStats } from "@/lib/leetcode/leetcode-client";
import {
  LeetCodeHttpError,
  LeetCodeTimeoutError,
  LeetCodeNetworkError,
  LeetCodeInvalidResponseError,
} from "@/lib/leetcode/leetcode-client";

export type SyncStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type SyncStage = "FETCH_STATS" | "FETCH_SUBMISSIONS" | "CROSS_REFERENCE" | "PERSIST";
export type SyncFailureReason =
  | "TIMEOUT"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "DB_ERROR"
  | "NETWORK_ERROR";

export interface SyncResult {
  syncId: string;
  status: SyncStatus;
  startedAt: Date;
  completedAt?: Date;
  stats?: LeetCodeStats;
  newlySolvedCount?: number;
  error?: {
    stage: SyncStage;
    reason: SyncFailureReason;
    detail?: string;
  };
}

export async function getSyncStatus(userId: string): Promise<SyncResult | null> {
  await connectDB();

  const record = await LeetCodeSync.findOne({ userId })
    .sort({ startedAt: -1 })
    .limit(1)
    .lean();

  if (!record) return null;

  return {
    syncId: record._id.toString(),
    status: record.status,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    stats: record.stats
      ? {
          totalSolved: record.stats.total ?? 0,
          easySolved: record.stats.easy ?? 0,
          mediumSolved: record.stats.medium ?? 0,
          hardSolved: record.stats.hard ?? 0,
        }
      : undefined,
    newlySolvedCount: record.newlySolvedCount,
    error: record.error
      ? {
          stage: record.error.stage as SyncStage,
          reason: record.error.reason as SyncFailureReason,
          detail: record.error.detail,
        }
      : undefined,
  };
}

export async function getCronEligibleUsers(): Promise<string[]> {
  await connectDB();

  // Step 1: get all users with leetcodeUsername set and auto-sync enabled
  const eligibleUsers = await User.find(
    {
      leetcodeUsername: { $exists: true, $ne: null },
      leetcodeSyncEnabled: true,
    },
    { _id: 1 }
  ).lean();

  if (eligibleUsers.length === 0) return [];

  const userIds = eligibleUsers.map((u) => u._id as Types.ObjectId);
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 60 minutes ago

  // Step 2: get the most recent sync record for each eligible user
  const recentSyncs = await LeetCodeSync.aggregate<{
    _id: Types.ObjectId; // userId
    latestStartedAt: Date;
  }>([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: "$userId",
        latestStartedAt: { $max: "$startedAt" },
      },
    },
  ]);

  // Build a lookup map: userId string → latestStartedAt
  const latestSyncMap = new Map<string, Date>();
  for (const entry of recentSyncs) {
    latestSyncMap.set(entry._id.toString(), entry.latestStartedAt);
  }

  // Step 3: filter in memory — keep users with no recent sync or last sync ≥ 60 min ago
  return userIds
    .filter((id) => {
      const lastSync = latestSyncMap.get(id.toString());
      // No sync record at all → eligible
      if (!lastSync) return true;
      // Last sync was 60+ minutes ago → eligible
      return lastSync <= cutoff;
    })
    .map((id) => id.toString());
}

interface CrossReferenceResult {
  newlySolvedCount: number;
}

async function crossReferenceAndUpsert(
  userId: string,
  rawSubmissions: Array<{ titleSlug: string; timestamp: number }>,
  startedAt: Date
): Promise<CrossReferenceResult> {
  // Filter: keep only entries where titleSlug is non-empty string AND timestamp is positive number
  const validSubmissions = rawSubmissions.filter(
    (s) =>
      typeof s.titleSlug === "string" &&
      s.titleSlug.trim().length > 0 &&
      typeof s.timestamp === "number" &&
      s.timestamp > 0
  );

  if (validSubmissions.length === 0) return { newlySolvedCount: 0 };

  const slugs = [...new Set(validSubmissions.map((s) => s.titleSlug))];

  // Batch-lookup problems by slug
  const problems = await Problem.find({ slug: { $in: slugs } }, { _id: 1, slug: 1 }).lean();
  if (problems.length === 0) return { newlySolvedCount: 0 };

  // Build a slug → problemId map
  const slugToId = new Map(problems.map((p) => [p.slug, p._id.toString()]));

  // Build a slug → timestamp map (use earliest submission timestamp for each slug)
  const slugToTimestamp = new Map<string, Date>();
  for (const s of validSubmissions) {
    if (!slugToTimestamp.has(s.titleSlug)) {
      slugToTimestamp.set(s.titleSlug, new Date(s.timestamp * 1000));
    }
  }

  // Fetch existing UserProblem records for this user + these problems
  const problemIds = problems.map((p) => p._id);
  const existingRecords = await UserProblem.find(
    { userId, problemId: { $in: problemIds } },
    { problemId: 1, status: 1, solvedAt: 1 }
  ).lean();

  const existingMap = new Map(
    existingRecords.map((r) => [r.problemId.toString(), r])
  );

  // Build bulkWrite operations
  const bulkOps: Parameters<typeof UserProblem.bulkWrite>[0] = [];
  let newlySolvedCount = 0;

  for (const problem of problems) {
    const problemId = problem._id.toString();
    const solvedAt = slugToTimestamp.get(problem.slug) ?? startedAt;
    const existing = existingMap.get(problemId);

    if (existing?.status === "SOLVED") {
      // Already SOLVED — skip, preserve existing solvedAt
      continue;
    }

    newlySolvedCount++;

    if (existing) {
      // Update existing non-SOLVED record
      bulkOps.push({
        updateOne: {
          filter: { userId, problemId: problem._id },
          update: {
            $set: {
              status: "SOLVED",
              source: "LEETCODE_SYNC",
              solvedAt,
            },
          },
        },
      });
    } else {
      // Insert new record
      bulkOps.push({
        insertOne: {
          document: {
            userId,
            problemId: problem._id,
            status: "SOLVED",
            source: "LEETCODE_SYNC",
            solvedAt,
            notes: "",
            revisionCount: 0,
          },
        },
      });
    }
  }

  if (bulkOps.length > 0) {
    await UserProblem.bulkWrite(bulkOps, { ordered: true });
  }

  return { newlySolvedCount };
}

export async function runSync(userId: string): Promise<SyncResult> {
  await connectDB();

  const startedAt = new Date();

  // Step 1: Check for existing IN_PROGRESS sync → 409 equivalent (throw)
  const inProgress = await LeetCodeSync.findOne({ userId, status: "IN_PROGRESS" }).lean();
  if (inProgress) {
    throw Object.assign(new Error("Sync already in progress"), { code: 409 });
  }

  // Step 2: Evict oldest record if count >= 10
  const count = await LeetCodeSync.countDocuments({ userId });
  if (count >= 10) {
    const oldest = await LeetCodeSync.findOne({ userId }).sort({ startedAt: 1 }).lean();
    if (oldest) {
      await LeetCodeSync.deleteOne({ _id: oldest._id });
    }
  }

  // Step 3: Get user's leetcodeUsername
  const user = await User.findById(userId, { leetcodeUsername: 1 }).lean();
  const username = user?.leetcodeUsername;
  if (!username) {
    throw Object.assign(new Error("User has no LeetCode username configured"), { code: 400 });
  }

  // Step 4: Insert IN_PROGRESS Sync_Record
  const syncRecord = await LeetCodeSync.create({
    userId,
    status: "IN_PROGRESS",
    startedAt,
  });
  const syncId = syncRecord._id.toString();

  // Helper to mark sync FAILED and return
  const markFailed = async (
    stage: SyncStage,
    reason: SyncFailureReason,
    detail?: string
  ): Promise<SyncResult> => {
    const completedAt = new Date();
    await LeetCodeSync.findByIdAndUpdate(syncRecord._id, {
      status: "FAILED",
      completedAt,
      error: { stage, reason, detail },
    });
    return {
      syncId,
      status: "FAILED",
      startedAt,
      completedAt,
      error: { stage, reason, detail },
    };
  };

  const mapError = (err: unknown): SyncFailureReason => {
    if (err instanceof LeetCodeTimeoutError) return "TIMEOUT";
    if (err instanceof LeetCodeHttpError) return "HTTP_ERROR";
    if (err instanceof LeetCodeInvalidResponseError) return "INVALID_RESPONSE";
    if (err instanceof LeetCodeNetworkError) return "NETWORK_ERROR";
    return "DB_ERROR";
  };

  // Step 5: Fetch stats
  let stats: LeetCodeStats;
  try {
    stats = await leetcodeClient.fetchUserStats(username);
  } catch (err) {
    const detail = err instanceof LeetCodeHttpError ? `HTTP ${err.statusCode}` : String(err);
    console.error(`[runSync] FETCH_STATS failed for user ${userId}:`, err);
    return markFailed("FETCH_STATS", mapError(err), detail);
  }

  // Step 6: Fetch recent submissions
  let rawSubmissions: Array<{ titleSlug: string; timestamp: number }>;
  try {
    rawSubmissions = await leetcodeClient.fetchRecentSubmissions(username, 20);
  } catch (err) {
    const detail = err instanceof LeetCodeHttpError ? `HTTP ${err.statusCode}` : String(err);
    console.error(`[runSync] FETCH_SUBMISSIONS failed for user ${userId}:`, err);
    return markFailed("FETCH_SUBMISSIONS", mapError(err), detail);
  }

  // Step 7: Fetch submission calendar
  try {
    await leetcodeClient.fetchSubmissionCalendar(username);
  } catch (err) {
    const detail = err instanceof LeetCodeHttpError ? `HTTP ${err.statusCode}` : String(err);
    console.error(`[runSync] FETCH_SUBMISSIONS (calendar) failed for user ${userId}:`, err);
    return markFailed("FETCH_SUBMISSIONS", mapError(err), detail);
  }

  // Step 8-10: Cross-reference and bulk upsert
  let newlySolvedCount: number;
  try {
    const result = await crossReferenceAndUpsert(userId, rawSubmissions, startedAt);
    newlySolvedCount = result.newlySolvedCount;
  } catch (err) {
    return markFailed("PERSIST", "DB_ERROR", String(err));
  }

  // Step 11: Mark COMPLETED
  const completedAt = new Date();
  const dbStats = {
    total: stats.totalSolved,
    easy: stats.easySolved,
    medium: stats.mediumSolved,
    hard: stats.hardSolved,
  };

  await LeetCodeSync.findByIdAndUpdate(syncRecord._id, {
    status: "COMPLETED",
    completedAt,
    stats: dbStats,
    newlySolvedCount,
  });

  return {
    syncId,
    status: "COMPLETED",
    startedAt,
    completedAt,
    stats,
    newlySolvedCount,
  };
}
