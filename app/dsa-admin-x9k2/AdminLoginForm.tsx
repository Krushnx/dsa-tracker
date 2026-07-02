"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Shield } from "lucide-react";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#EF4444]" />
          </div>
          <h1 className="text-xl font-semibold text-[#FAFAFA]">Admin Access</h1>
          <p className="text-xs text-[#71717A] mt-1">DSA Tracker Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#71717A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#EF4444]/50 transition-colors"
              />
            </div>
            {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-10 rounded-xl bg-[#EF4444] text-white text-sm font-medium hover:bg-[#DC2626] disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
