"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, X, ExternalLink } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { StatusActionButton } from "./StatusActionButton";
import { Pagination } from "@/components/shared/Pagination";
import { ProblemTableSkeleton } from "@/components/shared/LoadingSkeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ProblemListItem, ProblemsResult } from "@/lib/services/problems.service";
import { useDebounce } from "@/hooks/useDebounce";

interface ProblemsTableProps {
  topics: string[];
}

const DIFFICULTY_OPTIONS = ["ALL", "Easy", "Medium", "Hard"];
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "SOLVED", label: "Solved" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "TODO", label: "Todo" },
  { value: "UNSOLVED", label: "Unsolved" },
];

export function ProblemsTable({ topics }: ProblemsTableProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [topic, setTopic] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProblemsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (difficulty !== "ALL") params.set("difficulty", difficulty);
      if (topic !== "ALL") params.set("topic", topic);
      if (status !== "ALL") params.set("status", status);
      params.set("page", String(page));
      params.set("limit", "50");

      const res = await fetch(`/api/problems?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, difficulty, topic, status, page]);

  useEffect(() => {
    // Reset to page 1 whenever filters change (but not when page itself changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, difficulty, topic, status]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const clearFilters = () => {
    setSearch("");
    setDifficulty("ALL");
    setTopic("ALL");
    setStatus("ALL");
    setPage(1);
  };

  const hasFilters = search || difficulty !== "ALL" || topic !== "ALL" || status !== "ALL";

  const updateStatus = (problemId: string) => {
    // Refresh data after status change
    setTimeout(fetchProblems, 300);
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl bg-[#111111] border border-[#262626] focus-within:border-[#3B82F6]/50 transition-colors">
          <Search className="w-4 h-4 text-[#71717A] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#71717A] hover:text-[#FAFAFA]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-colors ${
            hasFilters
              ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
              : "bg-[#111111] border-[#262626] text-[#A1A1AA] hover:text-[#FAFAFA]"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white text-[10px] flex items-center justify-center">
              {[difficulty !== "ALL", topic !== "ALL", status !== "ALL"].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Difficulty */}
          <div>
            <label className="block text-xs text-[#71717A] mb-1.5">Difficulty</label>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    difficulty === d
                      ? d === "Easy"
                        ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                        : d === "Medium"
                        ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                        : d === "Hard"
                        ? "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
                        : "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
                      : "bg-transparent border-[#262626] text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-[#71717A] mb-1.5">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    status === value
                      ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
                      : "bg-transparent border-[#262626] text-[#71717A] hover:text-[#A1A1AA]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs text-[#71717A] mb-1.5">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-[#0A0A0A] border border-[#262626] text-xs text-[#FAFAFA] outline-none focus:border-[#3B82F6]/50"
            >
              <option value="ALL">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#71717A]">
          {loading ? "Loading..." : `${data?.total ?? 0} problems`}
        </p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <ProblemTableSkeleton rows={10} />
      ) : !data || data.problems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description="Try adjusting your search or filters."
          actionLabel="Clear Filters"
          onAction={clearFilters}
          className="bg-[#111111] border border-[#262626] rounded-2xl"
        />
      ) : (
        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-16">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-28">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] hidden md:table-cell">Topics</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-24 hidden sm:table-cell">Acceptance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#71717A] w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.problems.map((problem: ProblemListItem) => (
                  <tr
                    key={problem._id}
                    className="border-b border-[#262626]/50 hover:bg-[#171717]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[#71717A] tabular-nums">
                      {problem.leetcodeId}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/problems/${problem.leetcodeId}`}
                        className="text-sm text-[#FAFAFA] hover:text-[#3B82F6] transition-colors font-medium"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {problem.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[10px] text-[#71717A] bg-[#262626]"
                          >
                            {t}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-[#71717A] bg-[#262626]">
                            +{problem.topics.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#71717A] tabular-nums">
                      {problem.acceptanceRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/problems/${problem.leetcodeId}`}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] transition-colors"
                          title="View details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <StatusActionButton
                          problemId={problem._id}
                          currentStatus={problem.userStatus}
                          compact
                          onStatusChange={() => updateStatus(problem._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
