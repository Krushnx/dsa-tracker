"use server";

import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import { UserSettings } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import { revalidatePath } from "next/cache";

export async function togglePinCompany(
  companySlug: string
): Promise<{ success: boolean; pinned: boolean }> {
  const s = await auth();
  if (!s?.user?.id) return { success: false, pinned: false };

  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email!);

  const settings = await UserSettings.findOne({ userId: uid });
  if (!settings) return { success: false, pinned: false };

  const pinned = settings.pinnedCompanies ?? [];
  const isCurrentlyPinned = pinned.includes(companySlug);

  if (isCurrentlyPinned) {
    settings.pinnedCompanies = pinned.filter((s: string) => s !== companySlug);
  } else {
    settings.pinnedCompanies = [...pinned, companySlug];
  }

  await settings.save();
  revalidatePath("/companies");

  return { success: true, pinned: !isCurrentlyPinned };
}
