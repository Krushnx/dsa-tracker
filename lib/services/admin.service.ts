import { connectDB } from "@/lib/db/mongoose";
import { User, UserProblem, Streak } from "@/models";
import PushSubscriptionModel from "@/models/PushSubscription";
import BuddyRequest from "@/models/BuddyRequest";
import mongoose from "mongoose";

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  image: string;
  provider: string;
  role: string;
  joinedAt: string;
  solved: number;
  attempted: number;
  todo: number;
  currentStreak: number;
  hasBuddy: boolean;
  buddyName?: string;
  buddyEmail?: string;
}

export interface AdminStats {
  totalUsers: number;
  credentialsUsers: number;
  googleUsers: number;
  totalSolved: number;
  totalAttempted: number;
  activePushSubscriptions: number;
  totalBuddyPairs: number;
  newUsersLast30: { date: string; count: number }[];
  solvedPerDay: { date: string; count: number }[];
  topProblems: { title: string; count: number; difficulty: string }[];
  difficultyBreakdown: { difficulty: string; count: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [
    totalUsers,
    providerBreakdown,
    totalSolved,
    totalAttempted,
    pushSubs,
    newUsersRaw,
    solvedPerDayRaw,
    topProblemsRaw,
    difficultyRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$provider", count: { $sum: 1 } } }]),
    UserProblem.countDocuments({ status: "SOLVED" }),
    UserProblem.countDocuments({ status: "ATTEMPTED" }),
    PushSubscriptionModel.countDocuments(),
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    UserProblem.aggregate([
      { $match: { status: "SOLVED", updatedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    UserProblem.aggregate([
      { $match: { status: "SOLVED" } },
      { $group: { _id: "$problemId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: "problems", localField: "_id", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $project: { title: "$p.title", difficulty: "$p.difficulty", count: 1 } },
    ]),
    UserProblem.aggregate([
      { $match: { status: "SOLVED" } },
      { $lookup: { from: "problems", localField: "problemId", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $group: { _id: "$p.difficulty", count: { $sum: 1 } } },
    ]),
  ]);

  // Fill in missing days
  const fillDays = (raw: { _id: string; count: number }[]) => {
    const map = new Map(raw.map(r => [r._id, r.count]));
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      result.push({ date: d, count: map.get(d) ?? 0 });
    }
    return result;
  };

  const provMap: Record<string, number> = {};
  for (const p of providerBreakdown) provMap[p._id] = p.count;

  // Count buddy pairs
  const totalBuddyPairs = await BuddyRequest.countDocuments({ status: "accepted" });

  return {
    totalUsers,
    credentialsUsers: provMap["credentials"] ?? 0,
    googleUsers: provMap["google"] ?? 0,
    totalSolved,
    totalAttempted,
    activePushSubscriptions: pushSubs,
    totalBuddyPairs,
    newUsersLast30: fillDays(newUsersRaw),
    solvedPerDay: fillDays(solvedPerDayRaw),
    topProblems: topProblemsRaw.map(p => ({ title: p.title, count: p.count, difficulty: p.difficulty })),
    difficultyBreakdown: difficultyRaw.map(d => ({ difficulty: d._id, count: d.count })),
  };
}

export async function getAdminUsers(page = 1, limit = 20, search = ""): Promise<{ users: AdminUserItem[]; total: number }> {
  await connectDB();

  const query = search
    ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map(u => u._id);

  const [progressData, streakData] = await Promise.all([
    UserProblem.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: { userId: "$userId", status: "$status" }, count: { $sum: 1 } } },
    ]),
    Streak.find({ userId: { $in: userIds } }).select("userId currentStreak").lean(),
  ]);

  // Buddy data via aggregate (more reliable than populate + lean)
  const buddyMap = new Map<string, { name: string; email: string }>();
  const pairs = await BuddyRequest.aggregate([
    {
      $match: {
        status: "accepted",
        $or: [{ senderId: { $in: userIds } }, { receiverId: { $in: userIds } }],
      },
    },
    {
      $lookup: { from: "users", localField: "senderId", foreignField: "_id", as: "sender" },
    },
    {
      $lookup: { from: "users", localField: "receiverId", foreignField: "_id", as: "receiver" },
    },
    { $unwind: "$sender" },
    { $unwind: "$receiver" },
    {
      $project: {
        "sender._id": 1, "sender.name": 1, "sender.email": 1,
        "receiver._id": 1, "receiver.name": 1, "receiver.email": 1,
      },
    },
  ]);

  for (const pair of pairs) {
    const sid = pair.sender._id.toString();
    const rid = pair.receiver._id.toString();
    buddyMap.set(sid, { name: pair.receiver.name, email: pair.receiver.email });
    buddyMap.set(rid, { name: pair.sender.name, email: pair.sender.email });
  }

  const progressMap = new Map<string, { solved: number; attempted: number; todo: number }>();
  for (const p of progressData) {
    const uid = p._id.userId.toString();
    if (!progressMap.has(uid)) progressMap.set(uid, { solved: 0, attempted: 0, todo: 0 });
    const entry = progressMap.get(uid)!;
    if (p._id.status === "SOLVED") entry.solved = p.count;
    else if (p._id.status === "ATTEMPTED") entry.attempted = p.count;
    else if (p._id.status === "TODO") entry.todo = p.count;
  }

  const streakMap = new Map(streakData.map(s => [s.userId.toString(), s.currentStreak]));

  return {
    total,
    users: users.map(u => {
      const uid = u._id.toString();
      const prog = progressMap.get(uid) ?? { solved: 0, attempted: 0, todo: 0 };
      const buddy = buddyMap.get(uid);
      return {
        _id: uid,
        name: u.name,
        email: u.email,
        image: u.image ?? "",
        provider: u.provider ?? "credentials",
        role: u.role ?? "USER",
        joinedAt: u.createdAt.toISOString(),
        solved: prog.solved,
        attempted: prog.attempted,
        todo: prog.todo,
        currentStreak: streakMap.get(uid) ?? 0,
        hasBuddy: !!buddy,
        buddyName: buddy?.name,
        buddyEmail: buddy?.email,
      };
    }),
  };
}
