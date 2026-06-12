  // Remove unused import
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getGoals } from "@/lib/services/goals.service";

export async function GET() {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await getGoals(s.user.id, s.user.email!);
  return NextResponse.json({ goals });
}
