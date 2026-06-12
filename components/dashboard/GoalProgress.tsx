import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardStats } from "@/lib/services/dashboard.service";

interface GoalProgressProps {
  stats: DashboardStats;
}

export function GoalProgress({ stats }: GoalProgressProps) {
  const hasGoal = stats.goalTarget > 0;
  const pct = hasGoal
    ? Math.min(Math.round((stats.goalProgress / stats.goalTarget) * 100), 100)
    : 0;

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Goal Progress</h3>
        <Link
          href="/goals"
          className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!hasGoal ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <p className="text-sm text-[#A1A1AA] mb-3">No active goal</p>
          <Link
            href="/goals"
            className="h-8 px-4 rounded-xl bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563EB] transition-colors"
          >
            Set a Goal
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-[#3B82F6]">{pct}%</p>
            <p className="text-xs text-[#71717A]">
              {stats.goalProgress} / {stats.goalTarget} problems
            </p>
          </div>
          <Progress
            value={pct}
            className="h-2 bg-[#262626]"
          />
          <p className="text-xs text-[#71717A] mt-2">
            {stats.goalTarget - stats.goalProgress} problems remaining
          </p>
        </div>
      )}
    </div>
  );
}
