import { connectDB } from "@/lib/db/mongoose";
import { Problem, UserProblem } from "@/models";
import type { ProblemStatus } from "@/types";

export interface ProblemListItem {
  _id: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  acceptanceRate: number;
  premiumOnly: boolean;
  category: string;
  userStatus?: ProblemStatus | null;
}

export interface ProblemDetail extends ProblemListItem {
  link: string;
  likes: number;
  dislikes: number;
  notes?: string;
}

export interface ProblemsResult {
  problems: ProblemListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProblemsFilters {
  search?: string;
  difficulty?: string;
  topic?: string;
  status?: string; // "ALL" | "SOLVED" | "ATTEMPTED" | "TODO" | "UNSOLVED"
  page?: number;
  limit?: number;
}

export async function getProblems(
  userId: string,
  filters: ProblemsFilters = {}
): Promise<ProblemsResult> {
  await connectDB();

  const { search, difficulty, topic, status, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  // Build problem filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (search?.trim()) {
    const num = parseInt(search.trim(), 10);
    if (!isNaN(num)) {
      query.leetcodeId = num;
    } else {
      query.$text = { $search: search.trim() };
    }
  }

  if (difficulty && difficulty !== "ALL") {
    query.difficulty = difficulty;
  }

  if (topic && topic !== "ALL") {
    query.topics = topic;
  }

  // Get user's progress for all problems (or filtered subset)
  const [userProblems] = await Promise.all([
    UserProblem.find({ userId }).select("problemId status notes").lean(),
    Problem.distinct("topics"), // kept for future topic filter
  ]);

  const userMap = new Map<string, ProblemStatus>();
  for (const up of userProblems) {
    userMap.set(up.problemId.toString(), up.status as ProblemStatus);
  }

  // Status filter — needs to be done after joining user data
  let solvedIds: string[] | undefined;
  let attemptedIds: string[] | undefined;
  let todoIds: string[] | undefined;
  let unsolvedQuery: string[] | undefined;

  if (status && status !== "ALL") {
    if (status === "UNSOLVED") {
      const tracked = Array.from(userMap.keys());
      unsolvedQuery = tracked;
    } else {
      const matchingIds = userProblems
        .filter((up) => up.status === status)
        .map((up) => up.problemId.toString());

      if (status === "SOLVED") solvedIds = matchingIds;
      else if (status === "ATTEMPTED") attemptedIds = matchingIds;
      else if (status === "TODO") todoIds = matchingIds;
    }
  }

  if (solvedIds !== undefined) {
    query._id = { $in: solvedIds.map((id) => id) };
  } else if (attemptedIds !== undefined) {
    query._id = { $in: attemptedIds };
  } else if (todoIds !== undefined) {
    query._id = { $in: todoIds };
  } else if (unsolvedQuery !== undefined) {
    query._id = { $nin: unsolvedQuery };
  }

  const [problems, total] = await Promise.all([
    Problem.find(query).sort({ leetcodeId: 1 }).skip(skip).limit(limit).lean(),
    Problem.countDocuments(query),
  ]);

  return {
    problems: problems.map((p) => ({
      _id: p._id.toString(),
      leetcodeId: p.leetcodeId,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty as "Easy" | "Medium" | "Hard",
      topics: p.topics,
      acceptanceRate: p.acceptanceRate,
      premiumOnly: p.premiumOnly,
      category: p.category,
      userStatus: userMap.get(p._id.toString()) ?? null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProblemById(
  leetcodeId: number,
  userId: string
): Promise<ProblemDetail | null> {
  await connectDB();

  const problem = await Problem.findOne({ leetcodeId }).lean();
  if (!problem) return null;

  const userProblem = await UserProblem.findOne({
    userId,
    problemId: problem._id,
  }).lean();

  return {
    _id: problem._id.toString(),
    leetcodeId: problem.leetcodeId,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty as "Easy" | "Medium" | "Hard",
    topics: problem.topics,
    acceptanceRate: problem.acceptanceRate,
    premiumOnly: problem.premiumOnly,
    category: problem.category,
    link: problem.link,
    likes: problem.likes,
    dislikes: problem.dislikes,
    userStatus: (userProblem?.status as ProblemStatus) ?? null,
    notes: userProblem?.notes ?? "",
  };
}

export async function getAllTopics(): Promise<string[]> {
  await connectDB();
  const topics = await Problem.distinct("topics");
  return (topics as string[]).filter(Boolean).sort();
}
