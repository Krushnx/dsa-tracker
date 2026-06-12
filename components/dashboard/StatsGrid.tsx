import { Code2, Flame, Target, Trophy } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { DashboardStats } from "@/lib/services/dashboard.service";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const dailyProgress = `${stats.solvedToday} / ${stats.dailyGoal}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Solved"
        value={stats.totalSolved}
        subValue={`${stats.easySolved}E · ${stats.mediumSolved}M · ${stats.hardSolved}H`}
        icon={<Code2 className="w-4 h-4" />}
        accent="blue"
      />
      <StatCard
        label="Current Streak"
        value={`${stats.currentStreak} 🔥`}
        subValue="days in a row"
        icon={<Flame className="w-4 h-4" />}
        accent="yellow"
      />
      <StatCard
        label="Longest Streak"
        value={stats.longestStreak}
        subValue="personal best"
        icon={<Trophy className="w-4 h-4" />}
        accent="green"
      />
      <StatCard
        label="Daily Goal"
        value={dailyProgress}
        subValue={stats.solvedToday >= stats.dailyGoal ? "Goal reached! 🎉" : "Keep going!"}
        icon={<Target className="w-4 h-4" />}
        accent={stats.solvedToday >= stats.dailyGoal ? "green" : "blue"}
      />
    </div>
  );
}
