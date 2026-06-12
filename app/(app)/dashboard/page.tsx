import { auth } from "@/lib/auth/auth";
import {
  getDashboardStats,
  getRecentActivity,
  getHeatmapData,
  getRecommendedProblems,
} from "@/lib/services/dashboard.service";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DifficultyBreakdown } from "@/components/dashboard/DifficultyBreakdown";
import { ContributionHeatmap } from "@/components/dashboard/ContributionHeatmap";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecommendedProblems } from "@/components/dashboard/RecommendedProblems";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";

export const metadata = {
  title: "Dashboard — DSA Tracker",
  description: "Track your LeetCode progress, streaks, and interview preparation.",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const firstName = session!.user.name?.split(" ")[0] ?? "there";

  // Fetch all data in parallel on the server
  const [stats, activities, heatmap, recommended] = await Promise.all([
    getDashboardStats(userId, session!.user.email!),
    getRecentActivity(userId, session!.user.email!),
    getHeatmapData(userId, session!.user.email!),
    getRecommendedProblems(userId, session!.user.email!),
  ]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-[#FAFAFA]">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5">
          {stats.currentStreak > 0
            ? `You're on a ${stats.currentStreak}-day streak. Keep it up!`
            : "Start solving to build your streak today."}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Contribution Heatmap — full width */}
      <ContributionHeatmap data={heatmap} />

      {/* Middle row: Difficulty + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DifficultyBreakdown stats={stats} />
        <GoalProgress stats={stats} />
      </div>

      {/* Bottom row: Recent Activity + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity activities={activities} />
        <RecommendedProblems problems={recommended} />
      </div>

      {/* Analytics */}
      <AnalyticsCharts />
    </div>
  );
}
