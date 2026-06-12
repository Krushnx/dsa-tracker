"use client";

import { useMemo } from "react";
import type { HeatmapDay } from "@/lib/services/dashboard.service";

interface ContributionHeatmapProps {
  data: HeatmapDay[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getColor(count: number): string {
  if (count === 0) return "#1a1a1a";
  if (count === 1) return "#166534";
  if (count === 2) return "#15803D";
  if (count <= 4) return "#16A34A";
  return "#22C55E";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const { weeks, monthLabels, totalSolved } = useMemo(() => {
    // Build a map of date -> count
    const countMap: Record<string, number> = {};
    let total = 0;
    for (const d of data) {
      countMap[d.date] = d.count;
      total += d.count;
    }

    // Build 52 weeks of days starting from today going back
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back to the Sunday of 52 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 52 * 7 + 1);
    // Align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const weeksArr: { date: string; count: number }[][] = [];
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;

    const cur = new Date(start);
    for (let w = 0; w < 53; w++) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = cur.toISOString().slice(0, 10);
        week.push({ date: key, count: countMap[key] ?? 0 });
        const m = cur.getMonth();
        if (m !== lastMonth && d === 0) {
          labels.push({ month: MONTHS[m], col: w });
          lastMonth = m;
        }
        cur.setDate(cur.getDate() + 1);
      }
      weeksArr.push(week);
    }

    return { weeks: weeksArr, monthLabels: labels, totalSolved: total };
  }, [data]);

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Activity</h3>
        <span className="text-xs text-[#71717A]">{totalSolved} submissions in the last year</span>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-max px-4 md:px-0">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 pl-8">
            {Array.from({ length: 53 }).map((_, i) => {
              const label = monthLabels.find((l) => l.col === i);
              return (
                <div key={i} className="w-3 text-[10px] text-[#71717A] leading-none">
                  {label?.month ?? ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAYS.map((day, i) => (
                <div key={day} className="w-6 h-3 text-[10px] text-[#71717A] flex items-center">
                  {i % 2 === 1 ? day.slice(0, 3) : ""}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    className="w-3 h-3 rounded-sm cursor-pointer group relative"
                    style={{ backgroundColor: getColor(cell.count) }}
                    title={
                      cell.count === 0
                        ? `No submissions on ${formatDate(cell.date)}`
                        : `${cell.count} submission${cell.count > 1 ? "s" : ""} on ${formatDate(cell.date)}`
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px] text-[#71717A] mr-1">Less</span>
            {["#1a1a1a", "#166534", "#15803D", "#16A34A", "#22C55E"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-[#71717A] ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
