import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#171717] border border-[#262626] flex items-center justify-center mb-4 text-[#71717A]">
          {icon}
        </div>
      )}
      <h3 className="text-[#FAFAFA] font-medium text-base mb-1">{title}</h3>
      {description && (
        <p className="text-[#71717A] text-sm max-w-xs mb-6">{description}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors inline-flex items-center"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="h-9 px-4 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
