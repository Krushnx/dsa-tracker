import { connectDB } from "@/lib/db/mongoose";
import { UserProblem } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export async function getAnalytics(userId: string, email?: string) {
  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const [solvedOverTime, difficultyDist, topicDist] = await Promise.all([
    // Daily solved counts for last 30 days
    UserProblem.aggregate([
      { $match: { userId: uid, status: "SOLVED", solvedAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$solvedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Difficulty distribution
    UserProblem.aggregate([
      { $match: { userId: uid, status: "SOLVED" } },
      { $lookup: { from: "problems", localField: "problemId", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $group: { _id: "$p.difficulty", count: { $sum: 1 } } },
    ]),

    // Top 10 topics
    UserProblem.aggregate([
      { $match: { userId: uid, status: "SOLVED" } },
      { $lookup: { from: "problems", localField: "problemId", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $unwind: "$p.topics" },
      { $group: { _id: "$p.topics", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  // Fill missing days in last 30
  const days: { date: string; count: number }[] = [];
  const map: Record<string, number> = {};
  for (const d of solvedOverTime) map[d._id] = d.count;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push({ date: d, count: map[d] ?? 0 });
  }

  return {
    solvedOverTime: days,
    difficultyDist: difficultyDist.map((d) => ({ name: d._id, value: d.count })),
    topicDist: topicDist.map((d) => ({ name: d._id, count: d.count })),
  };
}
