import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getProblems } from "@/lib/services/problems.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const result = await getProblems(session.user.id, {
      search: searchParams.get("search") ?? undefined,
      difficulty: searchParams.get("difficulty") ?? undefined,
      topic: searchParams.get("topic") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "50"),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/problems]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
