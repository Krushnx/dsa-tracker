"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { User, Lock, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, changePassword, updateSettings } from "@/lib/actions/profile.actions";

interface Props {
  user: { name: string; email: string; image?: string; provider: string; createdAt: string };
  settings: { dailyGoal: number; theme: string };
  stats: { solved: number; attempted: number; todo: number };
}

export function ProfileClient({ user, settings, stats }: Props) {
  const [name, setName] = useState(user.name);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleProfile = async () => {
    setLoading(true);
    const r = await updateProfile({ name });
    if (r.success) { toast.success(r.message); } else { toast.error(r.message); }
    setLoading(false);
  };

  const handlePassword = async () => {
    if (!curPwd || !newPwd) { toast.error("Fill in both fields"); return; }
    setLoading(true);
    const r = await changePassword({ currentPassword: curPwd, newPassword: newPwd });
    if (r.success) { toast.success(r.message); setCurPwd(""); setNewPwd(""); } else { toast.error(r.message); }
    setLoading(false);
  };

  const handleSettings = async () => {
    setLoading(true);
    const r = await updateSettings({ dailyGoal });
    if (r.success) { toast.success(r.message); } else { toast.error(r.message); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — user card */}
      <div className="space-y-4">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 text-center">
          <Avatar className="w-16 h-16 mx-auto mb-3">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="bg-[#3B82F6] text-white text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-[#FAFAFA] font-semibold">{user.name}</h2>
          <p className="text-xs text-[#71717A] mt-0.5">{user.email}</p>
          <p className="text-xs text-[#71717A] mt-1">Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#262626] pt-4">
            {[{ label: "Solved", v: stats.solved, c: "#22C55E" }, { label: "Attempted", v: stats.attempted, c: "#F59E0B" }, { label: "Todo", v: stats.todo, c: "#A1A1AA" }].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold" style={{ color: s.c }}>{s.v}</p>
                <p className="text-[10px] text-[#71717A]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-[#EF4444]/30 text-[#EF4444] text-sm hover:bg-[#EF4444]/10 transition-colors">
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>

      {/* Right — forms */}
      <div className="lg:col-span-2 space-y-4">
        {/* Edit profile */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><User className="w-4 h-4 text-[#3B82F6]" /><h3 className="text-sm font-medium text-[#FAFAFA]">Account</h3></div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#71717A] mb-1 block">Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] outline-none focus:border-[#3B82F6]/50" />
            </div>
            <div>
              <label className="text-xs text-[#71717A] mb-1 block">Email</label>
              <input value={user.email} disabled className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#71717A] outline-none opacity-60" />
            </div>
            <button onClick={handleProfile} disabled={loading} className="h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><Settings className="w-4 h-4 text-[#3B82F6]" /><h3 className="text-sm font-medium text-[#FAFAFA]">Preferences</h3></div>
          <div>
            <label className="text-xs text-[#71717A] mb-2 block">Daily Goal</label>
            <div className="flex gap-2">
              {[1,2,3,5].map(n => (
                <button key={n} onClick={() => setDailyGoal(n)} className={`flex-1 h-9 rounded-xl text-sm border transition-colors ${dailyGoal === n ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]" : "border-[#262626] text-[#71717A] hover:text-[#FAFAFA]"}`}>{n}</button>
              ))}
            </div>
            <button onClick={handleSettings} disabled={loading} className="mt-3 h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors">
              Save Preferences
            </button>
          </div>
        </div>

        {/* Change password — only for credentials users */}
        {user.provider === "credentials" && (
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Lock className="w-4 h-4 text-[#3B82F6]" /><h3 className="text-sm font-medium text-[#FAFAFA]">Change Password</h3></div>
            <div className="space-y-3">
              <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="Current password" className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50" />
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password (min 8 chars)" className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50" />
              <button onClick={handlePassword} disabled={loading} className="h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors">
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
