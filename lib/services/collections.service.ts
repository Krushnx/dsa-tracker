import { connectDB } from "@/lib/db/mongoose";
import { Problem, UserProblem } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import { COLLECTIONS } from "@/constants/collections";

export interface CollectionSummary {
  id: string;
  title: string;
  description: string;
  color: string;
  total: number;
  solved: number;
  attempted: number;
  percentage: number;
}

export interface CollectionProblem {
  _id: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  acceptanceRate: number;
  userStatus?: string | null;
}

export async function getCollectionSummaries(userId: string, email?: string): Promise<CollectionSummary[]> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const userProblems = await UserProblem.find({ userId: uid }).select("problemId status").lean();
  const problems = await Problem.find({}).select("_id leetcodeId").lean();

  const idMap = new Map(problems.map(p => [p.leetcodeId, p._id.toString()]));
  const statusMap = new Map(userProblems.map(up => [up.problemId.toString(), up.status]));

  return COLLECTIONS.map(col => {
    let solved = 0, attempted = 0;
    let total = 0;
    for (const lcId of col.problems) {
      const mongoId = idMap.get(lcId);
      if (!mongoId) continue;
      total++;
      const s = statusMap.get(mongoId);
      if (s === "SOLVED") solved++;
      else if (s === "ATTEMPTED") attempted++;
    }
    return {
      id: col.id,
      title: col.title,
      description: col.description,
      color: col.color,
      total,
      solved,
      attempted,
      percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
    };
  });
}

export async function getCollectionProblems(
  collectionId: string,
  userId: string,
  email?: string
): Promise<CollectionProblem[] | null> {
  const col = COLLECTIONS.find(c => c.id === collectionId);
  if (!col) return null;

  await connectDB();
  const uid = await getUserObjectId(userId, email);

  const [problems, userProblems] = await Promise.all([
    Problem.find({ leetcodeId: { $in: col.problems } }).lean(),
    UserProblem.find({ userId: uid }).select("problemId status").lean(),
  ]);

  const statusMap = new Map(userProblems.map(up => [up.problemId.toString(), up.status]));
  const orderMap = new Map(col.problems.map((id, i) => [id, i]));

  return problems
    .sort((a, b) => (orderMap.get(a.leetcodeId) ?? 0) - (orderMap.get(b.leetcodeId) ?? 0))
    .map(p => ({
      _id: p._id.toString(),
      leetcodeId: p.leetcodeId,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
      topics: p.topics,
      acceptanceRate: p.acceptanceRate,
      userStatus: statusMap.get(p._id.toString()) ?? null,
    }));
}
