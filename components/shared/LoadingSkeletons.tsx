import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20 bg-[#262626]" />
        <Skeleton className="h-8 w-8 rounded-lg bg-[#262626]" />
      </div>
      <Skeleton className="h-8 w-16 bg-[#262626]" />
      <Skeleton className="h-3 w-24 mt-2 bg-[#262626]" />
    </div>
  );
}

export function StatCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#262626]">
      <td className="px-4 py-3"><Skeleton className="h-4 w-8 bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-48 bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-md bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24 bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-12 bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-md bg-[#262626]" /></td>
      <td className="px-4 py-3"><Skeleton className="h-7 w-20 rounded-lg bg-[#262626]" /></td>
    </tr>
  );
}

export function ProblemTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#262626]">
            {["#", "Title", "Difficulty", "Topics", "Acceptance", "Status", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-16 bg-[#262626]" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Skeleton className="h-4 w-40 bg-[#262626] mb-2" />
          <Skeleton className="h-3 w-24 bg-[#262626]" />
        </div>
        <Skeleton className="h-6 w-12 rounded-md bg-[#262626]" />
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-[#262626] mb-2" />
      <Skeleton className="h-3 w-32 bg-[#262626]" />
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-8 w-8 rounded-full bg-[#262626] flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3 w-48 bg-[#262626] mb-1" />
        <Skeleton className="h-3 w-24 bg-[#262626]" />
      </div>
    </div>
  );
}
