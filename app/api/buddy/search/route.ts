import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { searchUsers } from "@/lib/services/buddy.service";

export async function GET(req: NextRequest) {
  const s = await auth();
  if (!s?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json({ users: [] });
  }

  const users = await searchUsers(q, s.user.id, s.user.email);
  return NextResponse.json({ users });
}
