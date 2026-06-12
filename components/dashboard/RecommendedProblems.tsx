import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RecommendedProblem } from "@/lib/services/dashboard.service";

interface RecommendedProblemsProps {
  problems: RecommendedProblem[];
}

export function RecommendedProblems({ problems }: RecommendedProblemsProps) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Recommended Problems</h3>
        <Link
          href="/problems"
          className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {problems.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-5 h-5" />}
          title="No recommendations yet"
          description="Browse the full problem library to get started."
          actionLabel="Browse Problems"
          actionHref="/problems"
          className="py-8"
        />
      ) : (
        <div className="space-y-1">
          {problems.map((p) => (
            <Link
              key={p._id}
              href={`/problems/${p.leetcodeId}`}
              className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#171717] transition-colors group"
            >
              <span className="text-xs text-[#71717A] w-8 flex-shrink-0 tabular-nums">
                #{p.leetcodeId}
              </span>
              <span className="flex-1 text-sm text-[#FAFAFA] truncate group-hover:text-[#3B82F6] transition-colors">
                {p.title}
              </span>
              <DifficultyBadge difficulty={p.difficulty} />
              <span className="text-xs text-[#71717A] flex-shrink-0 hidden sm:block">
                {p.acceptanceRate.toFixed(1)}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
