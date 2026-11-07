import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { runSync } from "@/lib/services/leetcode-sync.service";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check user has a leetcodeUsername
    await connectDB();
    const user = await User.findById(userId, { leetcodeUsername: 1 }).lean();
    if (!user?.leetcodeUsername) {
      return NextResponse.json(
        { error: "No LeetCode username configured. Add one in Profile Settings." },
        { status: 400 }
      );
    }

    try {
      const result = await runSync(userId);
      return NextResponse.json({ syncId: result.syncId }, { status: 202 });
    } catch (err: unknown) {
      // runSync throws with code 409 when sync is already in progress
      if (err instanceof Error && (err as NodeJS.ErrnoException & { code?: number }).code === 409) {
        return NextResponse.json({ error: "Sync already in progress" }, { status: 409 });
      }
      throw err;
    }
  } catch (error) {
    console.error("[POST /api/leetcode/sync]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
