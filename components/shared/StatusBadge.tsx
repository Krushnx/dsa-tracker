import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, BookMarked, RotateCcw } from "lucide-react";

type Status = "SOLVED" | "ATTEMPTED" | "TODO" | "REVISION";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const config: Record<Status, { label: string; icon: React.ElementType; styles: string }> = {
  SOLVED: {
    label: "Solved",
    icon: CheckCircle2,
    styles: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
  },
  ATTEMPTED: {
    label: "Attempted",
    icon: Clock,
    styles: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
  },
  TODO: {
    label: "Todo",
    icon: BookMarked,
    styles: "text-[#A1A1AA] bg-[#A1A1AA]/10 border-[#A1A1AA]/20",
  },
  REVISION: {
    label: "Revision",
    icon: RotateCcw,
    styles: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, icon: Icon, styles } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        styles,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
