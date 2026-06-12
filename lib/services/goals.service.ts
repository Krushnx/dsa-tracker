import { connectDB } from "@/lib/db/mongoose";
import { Goal, Activity } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";

export interface GoalItem {
  _id: string;
  title: string;
  targetProblems: number;
  currentProgress: number;
  status: string;
  startDate: string;
  targetDate?: string;
  percentage: number;
}

export async function getGoals(userId: string, email?: string): Promise<GoalItem[]> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  const goals = await Goal.find({ userId: uid }).sort({ createdAt: -1 }).lean();
  return goals.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    targetProblems: g.targetProblems,
    currentProgress: g.currentProgress,
    status: g.status,
    startDate: g.startDate.toISOString(),
    targetDate: g.targetDate?.toISOString(),
    percentage: Math.min(Math.round((g.currentProgress / g.targetProblems) * 100), 100),
  }));
}

export async function createGoal(
  userId: string,
  email: string,
  data: { title: string; targetProblems: number; targetDate?: string }
): Promise<{ success: boolean; message: string }> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  const goal = await Goal.create({ userId: uid, ...data, status: "ACTIVE" });
  await Activity.create({ userId: uid, type: "GOAL_CREATED", title: `Goal created: ${data.title}`, metadata: { goalId: goal._id } });
  return { success: true, message: "Goal created" };
}

export async function updateGoal(
  userId: string,
  email: string,
  goalId: string,
  data: { title?: string; targetProblems?: number; targetDate?: string; status?: string }
): Promise<{ success: boolean; message: string }> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  await Goal.findOneAndUpdate({ _id: goalId, userId: uid }, { $set: data });
  return { success: true, message: "Goal updated" };
}

export async function deleteGoal(
  userId: string,
  email: string,
  goalId: string
): Promise<{ success: boolean; message: string }> {
  await connectDB();
  const uid = await getUserObjectId(userId, email);
  await Goal.findOneAndDelete({ _id: goalId, userId: uid });
  return { success: true, message: "Goal deleted" };
}
