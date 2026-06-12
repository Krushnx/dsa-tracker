import { CheckCircle2, Clock, Target, Trophy, Flame } from "lucide-react";
import type { ActivityItem } from "@/lib/services/dashboard.service";
import { EmptyState } from "@/components/shared/EmptyState";

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PROBLEM_SOLVED: { icon: CheckCircle2, color: "#22C55E", bg: "#22C55E15" },
  PROBLEM_ATTEMPTED: { icon: Clock, color: "#F59E0B", bg: "#F59E0B15" },
  GOAL_CREATED: { icon: Target, color: "#3B82F6", bg: "#3B82F615" },
  GOAL_COMPLETED: { icon: Trophy, color: "#A855F7", bg: "#A855F715" },
  STREAK_MILESTONE: { icon: Flame, color: "#F59E0B", bg: "#F59E0B15" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Recent Activity</h3>

      {activities.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Start solving problems to see your activity here."
          className="py-8"
        />
      ) : (
        <div className="space-y-1">
          {activities.map((item) => {
            const config = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.PROBLEM_SOLVED;
            const Icon = config.icon;
            return (
              <div key={item._id} className="flex items-center gap-3 py-2 rounded-xl hover:bg-[#171717] px-2 -mx-2 transition-colors">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#FAFAFA] truncate">{item.title}</p>
                </div>
                <span className="text-xs text-[#71717A] flex-shrink-0">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
