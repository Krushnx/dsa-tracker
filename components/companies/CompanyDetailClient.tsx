"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { StatusActionButton } from "@/components/problems/StatusActionButton";
import type { ProblemStatus } from "@/types";
import type { CompanyProblemItem, CompanyStats } from "@/lib/services/companies.service";

interface CompanyDetailClientProps {
  companySlug: string;
  stats: CompanyStats[];
}

const TIMEFRAME_LABELS: Record<string, string> = {
  "30days": "30 Days",
  "3months": "3 Months",
  "6months": "6 Months",
  "6months+": "6 Months+",
  all: "All",
};

const TIMEFRAMES = ["30days", "3months", "6months", "6months+", "all"] as const;

export function CompanyDetailClient({ companySlug, stats }: CompanyDetailClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [problems, setProblems] = useState<CompanyProblemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = useCallback(async (timeframe: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/companies/${companySlug}?timeframe=${timeframe}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json() as { problems: CompanyProblemItem[] };
      setProblems(data.problems);
    } catch {
      setError("Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    fetchProblems(activeTab);
  }, [activeTab, fetchProblems]);

  const statForTab = stats.find((s) => s.timeframe === activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111111] border border-[#262626] rounded-xl p-1 mb-4 overflow-x-auto">
        {TIMEFRAMES.map((tf) => {
          const stat = stats.find((s) => s.timeframe === tf);
          const isActive = activeTab === tf;
          return (
            <button
              key={tf}
              onClick={() => setActiveTab(tf)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                  : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              {TIMEFRAME_LABELS[tf]}
              {stat && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                      : "bg-[#262626] text-[#71717A]"
                  }`}
                >
                  {stat.total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats strip */}
      {statForTab && statForTab.total > 0 && (
        <div className="flex gap-4 text-xs text-[#71717A] mb-4 px-1">
          <span>
            <span className="text-[#22C55E] font-medium">{statForTab.solved}</span> solved
          </span>
          <span>
            <span className="text-[#F59E0B] font-medium">{statForTab.attempted}</span> attempted
          </span>
          <span>
            <span className="text-[#A1A1AA] font-medium">{statForTab.todo}</span> todo
          </span>
          <span>
            <span className="text-[#FAFAFA] font-medium">{statForTab.total}</span> total
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#3B82F6] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#EF4444]">{error}</p>
            <button
              onClick={() => fetchProblems(activeTab)}
              className="mt-3 text-xs text-[#3B82F6] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#71717A]">
              No problems found for this timeframe.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-20">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-28">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-32 hidden md:table-cell">
                    Acceptance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#71717A] w-36">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-[#262626]/50 hover:bg-[#171717]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[#71717A]">
                      {p.frequency.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      {p.leetcodeId ? (
                        <Link
                          href={`/problems/${p.leetcodeId}`}
                          className="text-sm text-[#FAFAFA] hover:text-[#3B82F6] transition-colors font-medium"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#FAFAFA] hover:text-[#3B82F6] transition-colors font-medium inline-flex items-center gap-1"
                        >
                          {p.title}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={p.difficulty as "Easy" | "Medium" | "Hard"} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#71717A] hidden md:table-cell">
                      {(p.acceptanceRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] transition-colors"
                            aria-label="Open on LeetCode"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {p.problemId ? (
                          <StatusActionButton
                            problemId={p.problemId}
                            currentStatus={p.userStatus as ProblemStatus | null}
                            compact
                          />
                        ) : (
                          <span className="text-[10px] text-[#3B3B3B] px-2">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
