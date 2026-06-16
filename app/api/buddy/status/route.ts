import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getBuddyStatus } from "@/lib/services/buddy.service";

export async function GET() {
  const s = await auth();
  if (!s?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getBuddyStatus(s.user.id, s.user.email);
  return NextResponse.json(status);
}
