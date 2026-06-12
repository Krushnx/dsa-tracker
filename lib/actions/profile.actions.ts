"use server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User, UserSettings } from "@/models";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string }) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email!);
  await User.findByIdAndUpdate(uid, { name: data.name });
  revalidatePath("/profile");
  return { success: true, message: "Profile updated" };
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email!);
  const user = await User.findById(uid).select("+passwordHash");
  if (!user?.passwordHash) return { success: false, message: "Cannot change password for OAuth accounts" };
  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, message: "Current password is incorrect" };
  user.passwordHash = await bcrypt.hash(data.newPassword, 12);
  await user.save();
  return { success: true, message: "Password changed successfully" };
}

export async function updateSettings(data: { dailyGoal?: number; theme?: string }) {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };
  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email!);
  await UserSettings.findOneAndUpdate({ userId: uid }, { $set: data }, { upsert: true });
  revalidatePath("/profile");
  return { success: true, message: "Settings saved" };
}
