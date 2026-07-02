import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth/adminAuth";
import { getAdminStats } from "@/lib/services/admin.service";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
