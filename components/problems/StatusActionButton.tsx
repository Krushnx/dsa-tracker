"use client";

import { useState } from "react";
import { CheckCircle2, Clock, BookMarked, RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { markProblemStatus } from "@/lib/actions/progress.actions";
import type { ProblemStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusActionButtonProps {
  problemId: string;
  currentStatus?: ProblemStatus | null;
  compact?: boolean;
  onStatusChange?: (status: ProblemStatus) => void;
}

const STATUS_OPTIONS: { value: ProblemStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "SOLVED", label: "Mark Solved", icon: CheckCircle2, color: "#22C55E" },
  { value: "ATTEMPTED", label: "Mark Attempted", icon: Clock, color: "#F59E0B" },
  { value: "TODO", label: "Add to Todo", icon: BookMarked, color: "#A1A1AA" },
  { value: "REVISION", label: "Mark Revision", icon: RotateCcw, color: "#3B82F6" },
];

const STATUS_DISPLAY: Record<ProblemStatus, { label: string; color: string; bg: string }> = {
  SOLVED: { label: "Solved", color: "#22C55E", bg: "#22C55E15" },
  ATTEMPTED: { label: "Attempted", color: "#F59E0B", bg: "#F59E0B15" },
  TODO: { label: "Todo", color: "#A1A1AA", bg: "#A1A1AA15" },
  REVISION: { label: "Revision", color: "#3B82F6", bg: "#3B82F615" },
};

export function StatusActionButton({
  problemId,
  currentStatus,
  compact = false,
  onStatusChange,
}: StatusActionButtonProps) {
  const [status, setStatus] = useState<ProblemStatus | null | undefined>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (newStatus: ProblemStatus) => {
    setLoading(true);
    try {
      const result = await markProblemStatus(problemId, newStatus);
      if (result.success) {
        setStatus(newStatus);
        toast.success(result.message);
        onStatusChange?.(newStatus);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const display = status ? STATUS_DISPLAY[status] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          role="button"
          aria-haspopup="true"
          tabIndex={0}
          data-disabled={loading || undefined}
          className={cn(
            "flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors border select-none outline-none",
            loading ? "opacity-50 pointer-events-none" : "cursor-pointer",
            compact ? "h-7 px-2" : "h-9 px-3",
            display
              ? "border-transparent"
              : "border-[#262626] text-[#A1A1AA] hover:bg-[#171717] bg-transparent"
          )}
          style={
            display
              ? { backgroundColor: display.bg, color: display.color, borderColor: "transparent" }
              : undefined
          }
        >
          {loading ? (
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : display ? (
            <>
              <span>{display.label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </>
          ) : (
            <>
              <span>Track</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-[#111111] border-[#262626]"
      >
        {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "cursor-pointer hover:bg-[#171717] focus:bg-[#171717] gap-2",
              status === value ? "opacity-50 pointer-events-none" : ""
            )}
          >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-[#FAFAFA] text-xs">{label}</span>
            {status === value && (
              <span className="ml-auto text-[10px]" style={{ color }}>✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
