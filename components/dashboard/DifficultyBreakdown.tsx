import type { DashboardStats } from "@/lib/services/dashboard.service";

interface DifficultyBreakdownProps {
  stats: DashboardStats;
}

const DIFFICULTIES = [
  { key: "Easy" as const, color: "#22C55E", solvedKey: "easySolved" as const, totalKey: "totalEasy" as const },
  { key: "Medium" as const, color: "#F59E0B", solvedKey: "mediumSolved" as const, totalKey: "totalMedium" as const },
  { key: "Hard" as const, color: "#EF4444", solvedKey: "hardSolved" as const, totalKey: "totalHard" as const },
];

export function DifficultyBreakdown({ stats }: DifficultyBreakdownProps) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Difficulty Breakdown</h3>
      <div className="space-y-4">
        {DIFFICULTIES.map(({ key, color, solvedKey, totalKey }) => {
          const solved = stats[solvedKey];
          const total = stats[totalKey];
          const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color }}>
                  {key}
                </span>
                <span className="text-xs text-[#71717A]">
                  {solved} / {total}
                </span>
              </div>
              <div className="h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <p className="text-[10px] text-[#71717A] mt-1">{pct}% solved</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
