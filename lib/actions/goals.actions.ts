"use server";
import { auth } from "@/lib/auth/auth";
import { createGoal, updateGoal, deleteGoal } from "@/lib/services/goals.service";
import { revalidatePath } from "next/cache";

export async function createGoalAction(data: { title: string; targetProblems: number; targetDate?: string }) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  const r = await createGoal(s.user.id, s.user.email!, data);
  if (r.success) revalidatePath("/goals");
  return r;
}

export async function updateGoalAction(goalId: string, data: { title?: string; targetProblems?: number; status?: string }) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  const r = await updateGoal(s.user.id, s.user.email!, goalId, data);
  if (r.success) revalidatePath("/goals");
  return r;
}

export async function deleteGoalAction(goalId: string) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  const r = await deleteGoal(s.user.id, s.user.email!, goalId);
  if (r.success) revalidatePath("/goals");
  return r;
}
