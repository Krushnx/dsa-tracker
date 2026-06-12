import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getDashboardStats,
  getRecentActivity,
  getHeatmapData,
  getRecommendedProblems,
} from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [stats, recentActivity, heatmap, recommended] = await Promise.all([
      getDashboardStats(userId, session.user.email!),
      getRecentActivity(userId, session.user.email!),
      getHeatmapData(userId, session.user.email!),
      getRecommendedProblems(userId, session.user.email!),
    ]);

    return NextResponse.json({ stats, recentActivity, heatmap, recommended });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
