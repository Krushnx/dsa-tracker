import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getAnalytics } from "@/lib/services/analytics.service";

export async function GET() {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getAnalytics(s.user.id, s.user.email!);
  return NextResponse.json(data);
}
