import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserProgress, getProgressSummary } from "@/lib/services/progress.service";
import type { ProblemStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as ProblemStatus | null;

    const [problems, summary] = await Promise.all([
      getUserProgress(session.user.id, status ?? undefined),
      getProgressSummary(session.user.id),
    ]);

    return NextResponse.json({ problems, summary });
  } catch (error) {
    console.error("[GET /api/user/problems]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
