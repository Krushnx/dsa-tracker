"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page numbers to show: always first, last, current ±1, with ellipsis
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 1;

    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    pages.push(1);

    if (range[0] > 2) pages.push("...");

    pages.push(...range);

    if (range[range.length - 1] < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-[#71717A] text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-[#3B82F6] text-white"
                : "text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA]"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
