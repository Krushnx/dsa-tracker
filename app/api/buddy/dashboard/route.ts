import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getBuddyDashboard } from "@/lib/services/buddy.service";

export async function GET() {
  const s = await auth();
  if (!s?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await getBuddyDashboard(s.user.id, s.user.email);
  if (!dashboard) {
    return NextResponse.json({ error: "No buddy found" }, { status: 404 });
  }
  return NextResponse.json(dashboard);
}
