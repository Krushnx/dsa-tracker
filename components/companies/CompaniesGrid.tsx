"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Building2, ArrowRight, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { togglePinCompany } from "@/lib/actions/companies.actions";
import type { CompanyListItem } from "@/lib/services/companies.service";

interface CompaniesGridProps {
  companies: CompanyListItem[];
  pinnedSlugs: string[];
}

export function CompaniesGrid({ companies, pinnedSlugs }: CompaniesGridProps) {
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<Set<string>>(new Set(pinnedSlugs));
  const [pending, startTransition] = useTransition();

  const handlePin = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isPinned = pinned.has(slug);
    // Optimistic update
    setPinned((prev) => {
      const next = new Set(prev);
      isPinned ? next.delete(slug) : next.add(slug);
      return next;
    });
    startTransition(async () => {
      const result = await togglePinCompany(slug);
      if (!result.success) {
        // Revert on failure
        setPinned((prev) => {
          const next = new Set(prev);
          isPinned ? next.add(slug) : next.delete(slug);
          return next;
        });
        toast.error("Failed to update pin");
      } else {
        toast.success(result.pinned ? "Company pinned" : "Company unpinned");
      }
    });
  };

  const filtered = query.trim()
    ? companies.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : companies;

  // Sort: pinned first, then alphabetical
  const sorted = [...filtered].sort((a, b) => {
    const aPinned = pinned.has(a.slug);
    const bPinned = pinned.has(b.slug);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const pinnedCount = sorted.filter((c) => pinned.has(c.slug)).length;

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#111111] border border-[#262626] text-[#71717A] mb-6 max-w-sm focus-within:border-[#3B82F6]/50 transition-colors">
        <Search className="w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
        />
      </div>

      {/* Pinned section header */}
      {!query && pinnedCount > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Pin className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-xs font-medium text-[#F59E0B]">Pinned Companies</span>
          <div className="flex-1 h-px bg-[#262626]" />
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="w-10 h-10 text-[#3B3B3B] mb-3" />
          <p className="text-sm text-[#71717A]">
            {query ? `No companies matching "${query}"` : "No companies found. Run npm run seed:companies first."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((company, i) => {
              const isPinned = pinned.has(company.slug);
              const isFirstUnpinned = !query && i === pinnedCount && pinnedCount > 0;
              const percentage =
                company.totalProblems > 0
                  ? Math.round((company.solvedCount / company.totalProblems) * 100)
                  : 0;

              return (
                <div key={company.slug}>
                  {/* Divider between pinned and rest */}
                  {isFirstUnpinned && (
                    <div className="col-span-full flex items-center gap-2 mb-1 -mt-1 hidden" />
                  )}
                  <Link
                    href={`/companies/${company.slug}`}
                    className={cn(
                      "bg-[#111111] border rounded-2xl p-5 hover:border-[#3B82F6]/30 transition-colors group block relative",
                      isPinned ? "border-[#F59E0B]/30" : "border-[#262626]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                          isPinned
                            ? "bg-[#F59E0B]/10 border-[#F59E0B]/20"
                            : "bg-[#1A1A2E] border-[#262626]"
                        )}
                      >
                        <Building2
                          className={cn("w-4 h-4", isPinned ? "text-[#F59E0B]" : "text-[#3B82F6]")}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Pin button */}
                        <button
                          onClick={(e) => handlePin(e, company.slug)}
                          disabled={pending}
                          aria-label={isPinned ? "Unpin company" : "Pin company"}
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                            isPinned
                              ? "text-[#F59E0B] hover:bg-[#F59E0B]/10"
                              : "text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] opacity-0 group-hover:opacity-100"
                          )}
                        >
                          {isPinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                          ) : (
                            <Pin className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#3B82F6] transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1 truncate pr-1">
                      {company.name}
                    </h3>
                    <p className="text-xs text-[#71717A] mb-4">
                      {company.totalProblems} problems
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#71717A]">Solved</span>
                        <span className="text-xs font-medium text-[#FAFAFA]">
                          {company.solvedCount} / {company.totalProblems}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#262626] overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isPinned ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* All companies divider when pinned exist and no search */}
          {!query && pinnedCount > 0 && pinnedCount < sorted.length && (
            <div className="flex items-center gap-2 mt-6 mb-4">
              <span className="text-xs text-[#71717A]">All Companies</span>
              <div className="flex-1 h-px bg-[#262626]" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
