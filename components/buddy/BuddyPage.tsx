"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { BuddyStatusResult, BuddyDashboard } from "@/lib/services/buddy.service";
import { NoBuddyView } from "@/components/buddy/NoBuddyView";
import { BuddyDashboardView } from "@/components/buddy/BuddyDashboardView";
import { removeBuddy } from "@/lib/actions/buddy.actions";

interface Props {
  initialStatus: BuddyStatusResult;
  initialDashboard: BuddyDashboard | null;
}

export function BuddyPage({ initialStatus, initialDashboard }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [removing, startRemoving] = useTransition();

  const refreshStatus = async () => {
    const res = await fetch("/api/buddy/status");
    const data = await res.json();
    setStatus(data);

    if (data.hasBuddy) {
      const dashRes = await fetch("/api/buddy/dashboard");
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboard(dashData);
      }
    } else {
      setDashboard(null);
    }
  };

  const handleRemoveBuddy = () => {
    startRemoving(async () => {
      const r = await removeBuddy();
      if (r.success) {
        toast.success(r.message);
        await refreshStatus();
      } else {
        toast.error(r.message);
      }
    });
  };

  if (status.hasBuddy && dashboard) {
    return (
      <BuddyDashboardView
        dashboard={dashboard}
        onRemoveBuddy={handleRemoveBuddy}
        removing={removing}
      />
    );
  }

  return (
    <NoBuddyView
      status={status}
      onStatusChange={refreshStatus}
    />
  );
}
