"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Code2, RefreshCw } from "lucide-react";

export function LeetCodeSettingsSection() {
  const [username, setUsername] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        setUsername(data.leetcodeUsername ?? "");
        setSyncEnabled(data.leetcodeSyncEnabled ?? false);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setFieldError(null);
    setLoading(true);

    try {
      // Step 1: validate username if non-empty
      if (username.trim()) {
        const valRes = await fetch("/api/leetcode/validate-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        });
        if (!valRes.ok) {
          const valData = await valRes.json();
          if (valData.error === "profile_not_found") {
            setFieldError("LeetCode profile not found for this username.");
          } else {
            setFieldError("Could not reach LeetCode. Please try again later.");
          }
          setLoading(false);
          return;
        }
      }

      // Step 2: save settings
      const saveRes = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: username.trim() || null,
          leetcodeSyncEnabled: syncEnabled,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save settings");

      toast.success("LeetCode settings saved");
      if (username.trim()) {
        toast.success(
          syncEnabled ? "Automatic sync enabled" : "Automatic sync disabled"
        );
      }
    } catch {
      toast.error("Failed to save LeetCode settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Code2 className="w-4 h-4 text-[#3B82F6]" />
        <h3 className="text-sm font-medium text-[#FAFAFA]">LeetCode Sync</h3>
      </div>

      <div className="space-y-4">
        {/* Username input */}
        <div>
          <label className="text-xs text-[#71717A] mb-1 block">
            LeetCode Username
          </label>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldError(null);
            }}
            placeholder="e.g. torvalds"
            className="w-full h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none focus:border-[#3B82F6]/50"
          />
          {fieldError && (
            <p className="text-xs text-[#EF4444] mt-1">{fieldError}</p>
          )}
          <p className="text-xs text-[#71717A] mt-1">
            Enter your public LeetCode username to sync your solved problems.
          </p>
        </div>

        {/* Auto-sync toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#FAFAFA]">Enable automatic sync</p>
            <p className="text-xs text-[#71717A]">
              Auto-sync your LeetCode progress every hour
            </p>
          </div>
          <button
            onClick={() => setSyncEnabled((v) => !v)}
            disabled={!username.trim()}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              syncEnabled && username.trim()
                ? "bg-[#3B82F6]"
                : "bg-[#262626]"
            } disabled:opacity-40`}
            aria-checked={syncEnabled}
            role="switch"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                syncEnabled && username.trim()
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
        >
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          {loading ? "Saving..." : "Save LeetCode Settings"}
        </button>
      </div>
    </div>
  );
}
