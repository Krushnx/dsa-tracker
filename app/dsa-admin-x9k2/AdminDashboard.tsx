"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, TrendingUp, CheckCircle2, Bell, Trophy,
  LogOut, Search, ChevronLeft, ChevronRight, RefreshCw,
  Shield, Activity, Database, Mail, Send,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminStats, AdminUserItem } from "@/lib/services/admin.service";

const DIFF_COLORS: Record<string, string> = { Easy: "#22C55E", Medium: "#F59E0B", Hard: "#EF4444" };

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: number | string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#71717A] uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center" style={{ color }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#71717A] mt-1">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "email">("overview");

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailFilter, setEmailFilter] = useState("all");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) { router.refresh(); return; }
      setStats(await res.json());
    } finally { setLoading(false); }
  }, [router]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      if (res.status === 401) { router.refresh(); return; }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } finally { setUsersLoading(false); }
  }, [page, search, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, html: emailBody, filter: emailFilter }),
      });
      const data = await res.json();
      if (res.ok) setEmailResult(data);
      else alert(data.error ?? "Failed to send");
    } catch {
      alert("Something went wrong");
    } finally {
      setEmailSending(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <header className="h-14 bg-[#111111] border-b border-[#262626] flex items-center px-6 gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#EF4444]" />
          <span className="font-semibold text-[#FAFAFA] text-sm">DSA Tracker Admin</span>
        </div>
        <div className="flex gap-1 ml-6">
          {(["overview", "users", "email"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`h-7 px-3 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-[#262626] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >{tab}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={fetchStats} className="h-7 w-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[#EF4444] text-xs hover:bg-[#EF4444]/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#111111] border border-[#262626] rounded-2xl p-5 h-24 animate-pulse" />
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.googleUsers} Google · ${stats.credentialsUsers} Email`} icon={Users} color="#3B82F6" />
                  <StatCard label="Total Solved" value={stats.totalSolved.toLocaleString()} sub="across all users" icon={CheckCircle2} color="#22C55E" />
                  <StatCard label="Total Attempted" value={stats.totalAttempted.toLocaleString()} icon={TrendingUp} color="#F59E0B" />
                  <StatCard label="Push Subscribers" value={stats.activePushSubscriptions} sub="active devices" icon={Bell} color="#A855F7" />
                  <StatCard label="Buddy Pairs" value={stats.totalBuddyPairs} sub="active partnerships" icon={Trophy} color="#F59E0B" />
                  <StatCard label="New (30d)" value={stats.newUsersLast30.reduce((s, d) => s + d.count, 0)} sub="new signups" icon={Activity} color="#06B6D4" />
                  <StatCard label="DB Problems" value="3,647" icon={Database} color="#71717A" />
                  <StatCard label="Solved Today" value={stats.solvedPerDay[stats.solvedPerDay.length - 1]?.count ?? 0} icon={CheckCircle2} color="#22C55E" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* New users */}
                  <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
                    <p className="text-sm font-medium text-[#A1A1AA] mb-4">New Users — Last 30 Days</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={stats.newUsersLast30}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={d => d.slice(5)} interval={6} />
                        <YAxis tick={{ fontSize: 9, fill: "#71717A" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 11 }} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="url(#g1)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Problems solved */}
                  <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
                    <p className="text-sm font-medium text-[#A1A1AA] mb-4">Problems Solved — Last 30 Days</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={stats.solvedPerDay}>
                        <defs>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#71717A" }} tickFormatter={d => d.slice(5)} interval={6} />
                        <YAxis tick={{ fontSize: 9, fill: "#71717A" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 11 }} />
                        <Area type="monotone" dataKey="count" stroke="#22C55E" fill="url(#g2)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Top problems */}
                  <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
                    <p className="text-sm font-medium text-[#A1A1AA] mb-4">Most Solved Problems</p>
                    <div className="space-y-2">
                      {stats.topProblems.map((p, i) => (
                        <div key={p.title} className="flex items-center gap-3">
                          <span className="text-xs text-[#71717A] w-5 text-right">{i + 1}</span>
                          <span className="flex-1 text-xs text-[#FAFAFA] truncate">{p.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: DIFF_COLORS[p.difficulty], backgroundColor: `${DIFF_COLORS[p.difficulty]}15` }}>{p.difficulty}</span>
                          <span className="text-xs font-medium text-[#3B82F6] w-8 text-right">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty pie */}
                  <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
                    <p className="text-sm font-medium text-[#A1A1AA] mb-4">Solved by Difficulty</p>
                    {stats.difficultyBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={stats.difficultyBreakdown} dataKey="count" nameKey="difficulty" cx="50%" cy="50%" outerRadius={70}
                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                            {stats.difficultyBreakdown.map(d => <Cell key={d.difficulty} fill={DIFF_COLORS[d.difficulty] ?? "#3B82F6"} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#171717", border: "1px solid #262626", borderRadius: 8, fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-[#71717A] text-center py-10">No data yet</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#71717A]">{total} users total</p>
              <form onSubmit={handleSearch} className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#111111] border border-[#262626]">
                <Search className="w-3.5 h-3.5 text-[#71717A]" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className="bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none w-52"
                />
              </form>
            </div>

            <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
              {usersLoading ? (
                <div className="p-8 text-center text-sm text-[#71717A]">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#262626]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Solved</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Attempted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Streak</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Buddy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-[#262626]/50 hover:bg-[#171717]/50 transition-colors">
                          {/* User profile */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={u.image} />
                                <AvatarFallback className="bg-[#3B82F6] text-white text-xs font-bold">
                                  {u.name[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#FAFAFA] truncate max-w-[140px]">{u.name}</p>
                                <p className="text-xs text-[#71717A] truncate max-w-[140px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              u.provider === "google"
                                ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20"
                                : "text-[#A1A1AA] bg-[#A1A1AA]/10 border-[#A1A1AA]/20"
                            }`}>
                              {u.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#71717A]">
                            {new Date(u.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-[#22C55E]">{u.solved}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-[#F59E0B]">{u.attempted}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#FAFAFA]">{u.currentStreak > 0 ? `🔥 ${u.currentStreak}` : "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            {u.hasBuddy ? (
                              <div>
                                <p className="text-xs font-medium text-[#A855F7] truncate max-w-[100px]">{u.buddyName}</p>
                                <p className="text-[10px] text-[#71717A] truncate max-w-[100px]">{u.buddyEmail}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-[#3B3B3B]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:bg-[#171717] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#71717A]">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:bg-[#171717] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── EMAIL TAB ── */}
        {activeTab === "email" && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h2 className="text-base font-semibold text-[#FAFAFA] mb-1">Send Email to Users</h2>
              <p className="text-xs text-[#71717A]">Use <code className="bg-[#262626] px-1 rounded">{"{{name}}"}</code> in the body to personalize with each user&apos;s name.</p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Filter */}
              <div>
                <label className="block text-xs text-[#71717A] mb-1.5">Recipients</label>
                <div className="flex gap-2">
                  {[["all", "All Users"], ["google", "Google Users"], ["credentials", "Email Users"]].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setEmailFilter(val)}
                      className={`h-8 px-3 rounded-lg text-xs border transition-colors ${
                        emailFilter === val
                          ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
                          : "border-[#262626] text-[#71717A] hover:text-[#FAFAFA]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs text-[#71717A] mb-1.5">Subject</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="e.g. New features on DSA Tracker 🚀"
                  className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50 transition-colors"
                />
              </div>

              {/* Body (HTML) */}
              <div>
                <label className="block text-xs text-[#71717A] mb-1.5">Email Body (HTML supported)</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  placeholder={`<h2>Hi {{name}} 👋</h2>\n<p>We just launched something new...</p>`}
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50 resize-y font-mono transition-colors"
                />
              </div>

              {/* Result */}
              {emailResult && (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                  <Mail className="w-4 h-4 text-[#22C55E]" />
                  <div className="text-xs">
                    <p className="font-medium text-[#22C55E]">Email sent successfully!</p>
                    <p className="text-[#71717A]">
                      {emailResult.sent} sent · {emailResult.failed} failed · {emailResult.total} total
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                className="flex items-center gap-2 h-10 px-6 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
              >
                {emailSending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {emailSending ? "Sending..." : "Send Email"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
