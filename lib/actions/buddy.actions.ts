"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import { getUserObjectId } from "@/lib/db/getUserObjectId";
import { BuddyRequest } from "@/models";

// ─── Send Request ─────────────────────────────────────────────────────────────

export async function sendBuddyRequest(
  receiverId: string
): Promise<{ success: boolean; message: string }> {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };

  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email);

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return { success: false, message: "Invalid receiver" };
  }
  const rid = new mongoose.Types.ObjectId(receiverId);

  if (uid.toString() === rid.toString()) {
    return { success: false, message: "Cannot send request to yourself" };
  }

  // Check if either user already has an accepted buddy
  const myBuddy = await BuddyRequest.findOne({
    $or: [{ senderId: uid }, { receiverId: uid }],
    status: "accepted",
  }).lean();
  if (myBuddy) return { success: false, message: "You already have a buddy" };

  const theirBuddy = await BuddyRequest.findOne({
    $or: [{ senderId: rid }, { receiverId: rid }],
    status: "accepted",
  }).lean();
  if (theirBuddy) return { success: false, message: "This user already has a buddy" };

  // Check for existing pending request between these two users
  const existing = await BuddyRequest.findOne({
    $or: [
      { senderId: uid, receiverId: rid },
      { senderId: rid, receiverId: uid },
    ],
    status: "pending",
  }).lean();
  if (existing) return { success: false, message: "A pending request already exists" };

  await BuddyRequest.create({ senderId: uid, receiverId: rid, status: "pending" });
  revalidatePath("/buddy");
  return { success: true, message: "Request sent!" };
}

// ─── Respond to Request ───────────────────────────────────────────────────────

export async function respondToBuddyRequest(
  requestId: string,
  action: "accept" | "decline"
): Promise<{ success: boolean; message: string }> {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };

  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email);

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return { success: false, message: "Invalid request" };
  }

  const request = await BuddyRequest.findOne({
    _id: requestId,
    receiverId: uid,
    status: "pending",
  });

  if (!request) return { success: false, message: "Request not found" };

  if (action === "accept") {
    // Make sure neither user has an existing buddy
    const senderBuddy = await BuddyRequest.findOne({
      $or: [{ senderId: request.senderId }, { receiverId: request.senderId }],
      status: "accepted",
      _id: { $ne: request._id },
    }).lean();
    if (senderBuddy) {
      await BuddyRequest.findByIdAndUpdate(requestId, { status: "declined" });
      revalidatePath("/buddy");
      return { success: false, message: "Sender already has a buddy" };
    }

    const myBuddy = await BuddyRequest.findOne({
      $or: [{ senderId: uid }, { receiverId: uid }],
      status: "accepted",
    }).lean();
    if (myBuddy) {
      await BuddyRequest.findByIdAndUpdate(requestId, { status: "declined" });
      revalidatePath("/buddy");
      return { success: false, message: "You already have a buddy" };
    }

    await BuddyRequest.findByIdAndUpdate(requestId, { status: "accepted" });
    revalidatePath("/buddy");
    return { success: true, message: "Buddy request accepted!" };
  } else {
    await BuddyRequest.findByIdAndUpdate(requestId, { status: "declined" });
    revalidatePath("/buddy");
    return { success: true, message: "Request declined" };
  }
}

// ─── Remove Buddy ─────────────────────────────────────────────────────────────

export async function removeBuddy(): Promise<{ success: boolean; message: string }> {
  const s = await auth();
  if (!s?.user?.id) return { success: false, message: "Unauthorized" };

  await connectDB();
  const uid = await getUserObjectId(s.user.id, s.user.email);

  const accepted = await BuddyRequest.findOne({
    $or: [{ senderId: uid }, { receiverId: uid }],
    status: "accepted",
  });

  if (!accepted) return { success: false, message: "No buddy to remove" };

  await BuddyRequest.findByIdAndDelete(accepted._id);
  revalidatePath("/buddy");
  return { success: true, message: "Buddy removed" };
}
