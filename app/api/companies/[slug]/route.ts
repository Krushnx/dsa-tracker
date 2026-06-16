import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getCompanyProblems } from "@/lib/services/companies.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") ?? "all";

    const session = await auth();
    const problems = await getCompanyProblems(
      slug,
      timeframe,
      session?.user?.id,
      session?.user?.email ?? undefined
    );

    return NextResponse.json({ problems });
  } catch (err) {
    console.error("[GET /api/companies/[slug]]", err);
    return NextResponse.json({ error: "Failed to fetch company problems" }, { status: 500 });
  }
}
