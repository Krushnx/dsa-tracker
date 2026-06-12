"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { StatusActionButton } from "./StatusActionButton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { UserProblemItem } from "@/lib/services/progress.service";

interface ProgressTableProps {
  items: UserProblemItem[];
  emptyTitle: string;
  emptyDescription: string;
  onRefresh: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProgressTable({
  items,
  emptyTitle,
  emptyDescription,
  onRefresh,
}: ProgressTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Browse Problems"
        actionHref="/problems"
        className="bg-[#111111] border border-[#262626] rounded-2xl py-16"
      />
    );
  }

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-16">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-28">Difficulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#71717A] w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className="border-b border-[#262626]/50 hover:bg-[#171717]/50 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-[#71717A] tabular-nums">
                  {item.leetcodeId}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/problems/${item.leetcodeId}`}
                    className="text-sm text-[#FAFAFA] hover:text-[#3B82F6] transition-colors font-medium"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <DifficultyBadge difficulty={item.difficulty} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-[#71717A]">
                  {formatDate(item.solvedAt ?? item.firstAttemptedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/problems/${item.leetcodeId}`}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <StatusActionButton
                      problemId={item.problemId}
                      currentStatus={item.status}
                      compact
                      onStatusChange={onRefresh}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
