"use server";

import { auth } from "@/lib/auth/auth";
import { updateProblemStatus, saveProblemNotes } from "@/lib/services/progress.service";
import type { ProblemStatus } from "@/types";
import { revalidatePath } from "next/cache";

export async function markProblemStatus(
  problemId: string,
  status: ProblemStatus
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const result = await updateProblemStatus(session.user.id, problemId, status);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/problems");
    revalidatePath("/progress");
  }

  return result;
}

export async function saveNotes(
  problemId: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  return saveProblemNotes(session.user.id, problemId, notes);
}
