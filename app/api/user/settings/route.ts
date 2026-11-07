import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models";
import { saveLeetCodeSettingsSchema } from "@/lib/validations/leetcode-sync";

// Task 8.4 — GET: return current user settings including LeetCode fields
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id, {
      leetcodeUsername: 1,
      leetcodeSyncEnabled: 1,
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      leetcodeUsername: user.leetcodeUsername ?? null,
      leetcodeSyncEnabled: user.leetcodeSyncEnabled ?? false,
    });
  } catch (error) {
    console.error("[GET /api/user/settings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Task 8.5 — PATCH: persist LeetCode settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = saveLeetCodeSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leetcodeUsername, leetcodeSyncEnabled } = parsed.data;

    await connectDB();

    if (leetcodeUsername === null) {
      // Unset the field entirely to keep the sparse index clean
      await User.findByIdAndUpdate(session.user.id, {
        $unset: { leetcodeUsername: "" },
        $set: { leetcodeSyncEnabled: false },
      });
    } else {
      await User.findByIdAndUpdate(session.user.id, {
        $set: {
          leetcodeUsername,
          leetcodeSyncEnabled,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/user/settings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
