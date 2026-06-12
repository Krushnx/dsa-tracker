import { connectDB } from "@/lib/db/mongoose";
import { UserProblem, Problem, Streak, Activity, UserSettings, Goal } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export interface DashboardStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  solvedToday: number;
  goalTarget: number;
  goalProgress: number;
}

export interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  createdAt: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface RecommendedProblem {
  _id: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  acceptanceRate: number;
}

export async function getDashboardStats(userId: string, email?: string): Promise<DashboardStats> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const [solvedByDifficulty, streak, settings, goal, totalsByDifficulty, todaySolved] =
    await Promise.all([
      UserProblem.aggregate([
        { $match: { userId: uid, status: "SOLVED" } },
        { $lookup: { from: "problems", localField: "problemId", foreignField: "_id", as: "problem" } },
        { $unwind: "$problem" },
        { $group: { _id: "$problem.difficulty", count: { $sum: 1 } } },
      ]),
      Streak.findOne({ userId: uid }).lean(),
      UserSettings.findOne({ userId: uid }).lean(),
      Goal.findOne({ userId: uid, status: "ACTIVE" }).lean(),
      Problem.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]),
      UserProblem.countDocuments({
        userId: uid, status: "SOLVED",
        solvedAt: { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setHours(23,59,59,999)) },
      }),
    ]);

  const solvedMap: Record<string, number> = {};
  for (const r of solvedByDifficulty) solvedMap[r._id] = r.count;
  const totalsMap: Record<string, number> = {};
  for (const r of totalsByDifficulty) totalsMap[r._id] = r.count;

  const easySolved = solvedMap["Easy"] ?? 0;
  const mediumSolved = solvedMap["Medium"] ?? 0;
  const hardSolved = solvedMap["Hard"] ?? 0;

  return {
    totalSolved: easySolved + mediumSolved + hardSolved,
    easySolved, mediumSolved, hardSolved,
    totalEasy: totalsMap["Easy"] ?? 0,
    totalMedium: totalsMap["Medium"] ?? 0,
    totalHard: totalsMap["Hard"] ?? 0,
    currentStreak: (streak as { currentStreak?: number } | null)?.currentStreak ?? 0,
    longestStreak: (streak as { longestStreak?: number } | null)?.longestStreak ?? 0,
    dailyGoal: (settings as { dailyGoal?: number } | null)?.dailyGoal ?? 2,
    solvedToday: todaySolved,
    goalTarget: (goal as { targetProblems?: number } | null)?.targetProblems ?? 0,
    goalProgress: (goal as { currentProgress?: number } | null)?.currentProgress ?? 0,
  };
}

export async function getRecentActivity(userId: string, email?: string, limit = 8): Promise<ActivityItem[]> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  const activities = await Activity.find({ userId: uid }).sort({ createdAt: -1 }).limit(limit).lean();
  return activities.map((a) => ({
    _id: String(a._id),
    type: a.type,
    title: a.title,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getHeatmapData(userId: string, email?: string): Promise<HeatmapDay[]> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const data = await UserProblem.aggregate([
    { $match: { userId: uid, status: "SOLVED", solvedAt: { $gte: oneYearAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$solvedAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return data.map((d) => ({ date: d._id, count: d.count }));
}

export async function getRecommendedProblems(userId: string, email?: string, limit = 5): Promise<RecommendedProblem[]> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  const trackedIds = await UserProblem.distinct("problemId", { userId: uid });
  const problems = await Problem.aggregate([
    { $match: { _id: { $nin: trackedIds }, premiumOnly: false } },
    { $sample: { size: limit } },
    { $project: { leetcodeId: 1, title: 1, slug: 1, difficulty: 1, topics: 1, acceptanceRate: 1 } },
  ]);
  return problems.map((p) => ({
    _id: String(p._id),
    leetcodeId: p.leetcodeId,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    topics: p.topics,
    acceptanceRate: p.acceptanceRate,
  }));
}
