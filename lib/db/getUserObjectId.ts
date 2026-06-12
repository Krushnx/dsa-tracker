import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models";

/**
 * Resolves a valid MongoDB ObjectId for a user.
 *
 * NextAuth stores the MongoDB _id for credentials users but a UUID
 * for Google OAuth users. This utility always returns the real ObjectId
 * by checking if the id is already a valid ObjectId hex string first,
 * then falling back to a DB lookup by email.
 */
export async function getUserObjectId(
  sessionUserId: string,
  sessionEmail?: string | null
): Promise<mongoose.Types.ObjectId> {
  // If it's already a valid 24-char hex ObjectId, use it directly
  if (mongoose.Types.ObjectId.isValid(sessionUserId) && sessionUserId.length === 24) {
    return new mongoose.Types.ObjectId(sessionUserId);
  }

  // Otherwise (UUID from Google OAuth) — look up by email
  await connectDB();

  if (!sessionEmail) {
    throw new Error("Cannot resolve user ObjectId: no email in session");
  }

  const user = await User.findOne({ email: sessionEmail }).select("_id").lean();
  if (!user) {
    throw new Error(`User not found for email: ${sessionEmail}`);
  }

  return user._id as mongoose.Types.ObjectId;
}
