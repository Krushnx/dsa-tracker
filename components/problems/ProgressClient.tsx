"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressTable } from "./ProgressTable";
import type { UserProblemItem, ProgressSummary } from "@/lib/services/progress.service";

export function ProgressClient() {
  const [tab, setTab] = useState("SOLVED");
  const [data, setData] = useState<{
    problems: UserProblemItem[];
    summary: ProgressSummary;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/problems?status=${status}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress(tab);
  }, [tab, fetchProgress]);

  const summary = data?.summary;

  const tabConfig = [
    { value: "SOLVED", label: "Solved", count: summary?.solved ?? 0, color: "text-[#22C55E]" },
    { value: "ATTEMPTED", label: "Attempted", count: summary?.attempted ?? 0, color: "text-[#F59E0B]" },
    { value: "TODO", label: "Todo", count: summary?.todo ?? 0, color: "text-[#A1A1AA]" },
    { value: "REVISION", label: "Revision", count: summary?.revision ?? 0, color: "text-[#3B82F6]" },
  ];

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v)}>
      <TabsList className="bg-[#111111] border border-[#262626] rounded-xl p-1 h-auto gap-1 mb-6">
        {tabConfig.map(({ value, label, count, color }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#262626] data-[state=active]:text-[#FAFAFA] text-[#71717A] transition-colors"
          >
            {label}
            <span className={`ml-2 text-xs font-medium ${color}`}>{count}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabConfig.map(({ value, label }) => (
        <TabsContent key={value} value={value}>
          {loading ? (
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 text-center">
              <p className="text-sm text-[#71717A]">Loading...</p>
            </div>
          ) : (
            <ProgressTable
              items={data?.problems ?? []}
              emptyTitle={`No ${label.toLowerCase()} problems yet`}
              emptyDescription={
                value === "SOLVED"
                  ? "Start solving problems to track your progress."
                  : value === "ATTEMPTED"
                  ? "Problems you've attempted will appear here."
                  : value === "TODO"
                  ? "Add problems to your todo list to stay organized."
                  : "Mark problems for revision to review later."
              }
              onRefresh={() => fetchProgress(value)}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
