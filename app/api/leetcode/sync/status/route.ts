import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getSyncStatus } from "@/lib/services/leetcode-sync.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getSyncStatus(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/leetcode/sync/status]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
