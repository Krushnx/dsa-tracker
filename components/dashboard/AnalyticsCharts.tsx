"use client";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const DIFF_COLORS: Record<string, string> = { Easy: "#22C55E", Medium: "#F59E0B", Hard: "#EF4444" };
const BAR_COLOR = "#3B82F6";

export function AnalyticsCharts() {
  const [data, setData] = useState<{ solvedOverTime: { date: string; count: number }[]; difficultyDist: { name: string; value: number }[]; topicDist: { name: string; count: number }[] } | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1,2,3].map(i => <div key={i} className="bg-[#111111] border border-[#262626] rounded-2xl p-5 h-64 animate-pulse" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Solved over time */}
      <div className="md:col-span-2 bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <p className="text-sm font-medium text-[#A1A1AA] mb-4">Problems Solved — Last 30 Days</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.solvedOverTime}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717A" }} tickFormatter={d => d.slice(5)} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#71717A" }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#FAFAFA" }} />
            <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Difficulty distribution */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <p className="text-sm font-medium text-[#A1A1AA] mb-4">Difficulty Distribution</p>
        {data.difficultyDist.length === 0 ? (
          <p className="text-xs text-[#71717A] text-center py-10">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.difficultyDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {data.difficultyDist.map((e) => <Cell key={e.name} fill={DIFF_COLORS[e.name] ?? "#3B82F6"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Topic distribution */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <p className="text-sm font-medium text-[#A1A1AA] mb-4">Top Topics</p>
        {data.topicDist.length === 0 ? (
          <p className="text-xs text-[#71717A] text-center py-10">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.topicDist} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "#71717A" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#71717A" }} width={80} />
              <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
