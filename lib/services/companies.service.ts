import { connectDB } from "@/lib/db/mongoose";
import { CompanyProblem, UserProblem, Problem } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export interface CompanyListItem {
  name: string;
  slug: string;
  totalProblems: number;
  solvedCount: number;
}

export interface CompanyProblemItem {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  frequency: number;
  acceptanceRate: number;
  link: string;
  topics: string[];
  timeframe: string;
  problemId: string | null;
  leetcodeId?: number | null;
  userStatus?: string | null;
}

export interface CompanyStats {
  timeframe: string;
  total: number;
  solved: number;
  attempted: number;
  todo: number;
}

// ─── getCompanyList ───────────────────────────────────────────────────────────
// Returns all unique companies with total problem count from "all" timeframe
// and user's solved count.
export async function getCompanyList(
  userId?: string,
  email?: string
): Promise<CompanyListItem[]> {
  await connectDB();

  // Aggregate unique companies and problem counts from "all" timeframe
  const companyCounts = (await CompanyProblem.aggregate([
    { $match: { timeframe: "all" } },
    {
      $group: {
        _id: "$companySlug",
        companyName: { $first: "$companyName" },
        companySlug: { $first: "$companySlug" },
        totalProblems: { $sum: 1 },
        problemIds: { $push: "$problemId" },
      },
    },
    { $sort: { companyName: 1 } },
  ])) as Array<{
    _id: string;
    companyName: string;
    companySlug: string;
    totalProblems: number;
    problemIds: (string | null)[];
  }>;

  // If no user, return without solved counts
  if (!userId) {
    return companyCounts.map((c) => ({
      name: c.companyName,
      slug: c.companySlug,
      totalProblems: c.totalProblems,
      solvedCount: 0,
    }));
  }

  const uid = await getUserObjectId(userId, email);
  const solvedProblems = await UserProblem.find({
    userId: uid,
    status: "SOLVED",
  })
    .select("problemId")
    .lean();

  const solvedSet = new Set(solvedProblems.map((p) => p.problemId.toString()));

  return companyCounts.map((c) => {
    const solvedCount = c.problemIds.filter(
      (pid) => pid && solvedSet.has(pid.toString())
    ).length;
    return {
      name: c.companyName,
      slug: c.companySlug,
      totalProblems: c.totalProblems,
      solvedCount,
    };
  });
}

// ─── getCompanyProblems ───────────────────────────────────────────────────────
// Returns problems for a company/timeframe with user status
export async function getCompanyProblems(
  companySlug: string,
  timeframe: string,
  userId?: string,
  email?: string
): Promise<CompanyProblemItem[]> {
  await connectDB();

  const rawProblems = await CompanyProblem.find({ companySlug, timeframe })
    .sort({ frequency: -1 })
    .lean();

  if (!rawProblems.length) return [];

  // Resolve user statuses
  let statusMap = new Map<string, string>();
  if (userId) {
    const uid = await getUserObjectId(userId, email);
    const validProblemIds = rawProblems
      .filter((p) => p.problemId)
      .map((p) => p.problemId!);

    if (validProblemIds.length > 0) {
      const userProblems = await UserProblem.find({
        userId: uid,
        problemId: { $in: validProblemIds },
      })
        .select("problemId status")
        .lean();

      statusMap = new Map(
        userProblems.map((up) => [up.problemId.toString(), up.status])
      );
    }
  }

  // We need leetcodeId for links; populate from Problem model
  let leetcodeIdMap = new Map<string, number>();
  const validProblemIdsForLc = rawProblems
    .filter((p) => p.problemId)
    .map((p) => p.problemId!);

  if (validProblemIdsForLc.length > 0) {
    const lcProblems = await Problem.find({
      _id: { $in: validProblemIdsForLc },
    })
      .select("_id leetcodeId")
      .lean() as Array<{ _id: { toString(): string }; leetcodeId: number }>;

    leetcodeIdMap = new Map(
      lcProblems.map((p) => [p._id.toString(), p.leetcodeId])
    );
  }

  return rawProblems.map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
    frequency: p.frequency,
    acceptanceRate: p.acceptanceRate,
    link: p.link,
    topics: p.topics,
    timeframe: p.timeframe,
    problemId: p.problemId ? p.problemId.toString() : null,
    leetcodeId: p.problemId
      ? (leetcodeIdMap.get(p.problemId.toString()) ?? null)
      : null,
    userStatus: p.problemId
      ? (statusMap.get(p.problemId.toString()) ?? null)
      : null,
  }));
}

// ─── getCompanyStats ──────────────────────────────────────────────────────────
// Returns solved/attempted/todo counts per timeframe for a company
export async function getCompanyStats(
  companySlug: string,
  userId?: string,
  email?: string
): Promise<CompanyStats[]> {
  await connectDB();

  const timeframes = ["30days", "3months", "6months", "6months+", "all"] as const;

  const allEntries = await CompanyProblem.find({ companySlug })
    .select("problemId timeframe")
    .lean();

  if (!allEntries.length) return [];

  let statusMap = new Map<string, string>();
  if (userId) {
    const uid = await getUserObjectId(userId, email);
    const validProblemIds = allEntries
      .filter((e) => e.problemId)
      .map((e) => e.problemId!);

    if (validProblemIds.length > 0) {
      const userProblems = await UserProblem.find({
        userId: uid,
        problemId: { $in: validProblemIds },
      })
        .select("problemId status")
        .lean();

      statusMap = new Map(
        userProblems.map((up) => [up.problemId.toString(), up.status])
      );
    }
  }

  return timeframes.map((tf) => {
    const entries = allEntries.filter((e) => e.timeframe === tf);
    let solved = 0, attempted = 0, todo = 0;

    for (const e of entries) {
      if (!e.problemId) continue;
      const status = statusMap.get(e.problemId.toString());
      if (status === "SOLVED") solved++;
      else if (status === "ATTEMPTED") attempted++;
      else if (status === "TODO") todo++;
    }

    return { timeframe: tf, total: entries.length, solved, attempted, todo };
  });
}
