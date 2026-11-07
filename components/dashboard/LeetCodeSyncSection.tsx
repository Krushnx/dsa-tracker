"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Code2,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatSyncAge } from "@/lib/utils/format-sync-age";

interface SyncStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

interface SyncStatus {
  syncId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
  stats?: SyncStats;
  newlySolvedCount?: number;
  error?: { stage: string; reason: string; detail?: string };
}

export function LeetCodeSyncSection() {
  const [username, setUsername] = useState<string | null>(null);
  const [syncRecord, setSyncRecord] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const prevStatusRef = useRef<string | null>(null);
  const pollFailCountRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/leetcode/sync/status");
      if (!res.ok) throw new Error("fetch failed");
      const data: SyncStatus | null = await res.json();
      pollFailCountRef.current = 0;

      if (data) {
        // Detect IN_PROGRESS → FAILED transition
        if (prevStatusRef.current === "IN_PROGRESS" && data.status === "FAILED") {
          toast.error("Sync failed. Please try again later.", { duration: 4000 });
          setSyncing(false);
          stopPolling();
        }
        // Detect IN_PROGRESS → COMPLETED transition
        if (prevStatusRef.current === "IN_PROGRESS" && data.status === "COMPLETED") {
          setSyncing(false);
          stopPolling();
        }
        prevStatusRef.current = data.status;
        setSyncRecord(data);
      }

      // Stop polling if sync is no longer in progress
      if (!data || data.status !== "IN_PROGRESS") {
        stopPolling();
        setSyncing(false);
      }
    } catch {
      pollFailCountRef.current++;
      if (pollFailCountRef.current >= 3) {
        stopPolling();
        setSyncing(false);
      }
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollFailCountRef.current = 0;
    pollIntervalRef.current = setInterval(fetchStatus, 3000);
  }, [fetchStatus, stopPolling]);

  useEffect(() => {
    // Load settings on mount
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        setUsername(data.leetcodeUsername ?? null);
        if (data.leetcodeUsername) {
          // Load initial sync status
          fetchStatus();
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));

    return () => stopPolling();
  }, [fetchStatus, stopPolling]);

  const handleSync = async () => {
    setSyncing(true);
    prevStatusRef.current = "IN_PROGRESS";
    try {
      const res = await fetch("/api/leetcode/sync", { method: "POST" });
      if (res.status === 409) {
        toast.error("Sync already in progress.");
        setSyncing(false);
        return;
      }
      if (!res.ok) throw new Error("Sync request failed");
      startPolling();
    } catch {
      toast.error("Failed to start sync. Please try again.");
      setSyncing(false);
    }
  };

  // For stats display: use last known completed stats from syncRecord if it's COMPLETED
  const displayStats =
    syncRecord?.status === "COMPLETED" ? syncRecord.stats : undefined;

  const syncStatusLabel = (): string => {
    if (!syncRecord) return "Never synced";
    if (syncRecord.status === "COMPLETED" && syncRecord.completedAt) {
      return `Last synced ${formatSyncAge(new Date(syncRecord.completedAt))}`;
    }
    if (syncRecord.status === "FAILED" && syncRecord.completedAt) {
      return `Last sync failed ${formatSyncAge(new Date(syncRecord.completedAt))}`;
    }
    if (syncRecord.status === "IN_PROGRESS") {
      return "Syncing...";
    }
    return "Never synced";
  };

  const isSyncInProgress = syncing || syncRecord?.status === "IN_PROGRESS";

  if (loadingSettings) return null;

  // No username configured — prompt user to connect
  if (!username) {
    return (
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">LeetCode Stats</h3>
        </div>
        <p className="text-sm text-[#71717A] mb-3">
          Connect your LeetCode account to sync your solved problems automatically.
        </p>
        <a
          href="/profile"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-medium hover:bg-[#8B5CF6]/20 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Connect in Profile Settings
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">LeetCode Stats</h3>
          {syncRecord?.status === "COMPLETED" && (
            <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
          )}
          {syncRecord?.status === "FAILED" && (
            <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#71717A]">{syncStatusLabel()}</span>
          <button
            onClick={handleSync}
            disabled={isSyncInProgress}
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-medium hover:bg-[#8B5CF6]/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-3 h-3 ${isSyncInProgress ? "animate-spin" : ""}`}
            />
            {isSyncInProgress ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Stats grid — only shown after a successful sync */}
      {displayStats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: displayStats.totalSolved, color: "#8B5CF6" },
            { label: "Easy", value: displayStats.easySolved, color: "#22C55E" },
            { label: "Medium", value: displayStats.mediumSolved, color: "#F59E0B" },
            { label: "Hard", value: displayStats.hardSolved, color: "#EF4444" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-3 text-center"
            >
              <p className="text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs text-[#71717A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        !isSyncInProgress && (
          <p className="text-sm text-[#71717A]">
            Click &ldquo;Sync Now&rdquo; to import your LeetCode stats.
          </p>
        )
      )}

      {/* Newly solved badge — shown after a completed sync with new problems */}
      {syncRecord?.status === "COMPLETED" &&
        (syncRecord.newlySolvedCount ?? 0) > 0 && (
          <p className="text-xs text-[#22C55E] mt-3">
            ✓ {syncRecord.newlySolvedCount} new problem
            {syncRecord.newlySolvedCount !== 1 ? "s" : ""} marked as solved
          </p>
        )}
    </div>
  );
}
