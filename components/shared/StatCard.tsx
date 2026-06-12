import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "yellow" | "red";
  className?: string;
}

const accentStyles = {
  blue: "text-[#3B82F6]",
  green: "text-[#22C55E]",
  yellow: "text-[#F59E0B]",
  red: "text-[#EF4444]",
};

export function StatCard({
  label,
  value,
  subValue,
  icon,
  accent = "blue",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[#111111] border border-[#262626] rounded-2xl p-5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#71717A] uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className={cn("w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center", accentStyles[accent])}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn("text-3xl font-bold", accentStyles[accent])}>{value}</p>
      {subValue && (
        <p className="text-xs text-[#71717A] mt-1">{subValue}</p>
      )}
    </div>
  );
}
