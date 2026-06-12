import { auth } from "@/lib/auth/auth";
import { getCollectionSummaries } from "@/lib/services/collections.service";
import { PageHeader } from "@/components/shared/PageHeader";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Collections — DSA Tracker" };

export default async function CollectionsPage() {
  const s = await auth();
  const collections = await getCollectionSummaries(s!.user.id, s!.user.email!);

  return (
    <div>
      <PageHeader title="Collections" description="Curated problem sets for structured interview preparation" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(col => (
          <Link key={col.id} href={`/collections/${col.id}`}
            className="bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:border-[#3B82F6]/30 transition-colors group block">
            <div className="flex items-center justify-between mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
              <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#3B82F6] transition-colors" />
            </div>
            <h3 className="text-base font-semibold text-[#FAFAFA] mb-1">{col.title}</h3>
            <p className="text-xs text-[#71717A] mb-4 line-clamp-2">{col.description}</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold" style={{ color: col.color }}>{col.percentage}%</span>
              <span className="text-xs text-[#71717A]">{col.solved} / {col.total}</span>
            </div>
            <Progress value={col.percentage} className="h-1.5 bg-[#262626]" />
            <div className="flex gap-3 mt-3 text-xs text-[#71717A]">
              <span><span className="text-[#22C55E] font-medium">{col.solved}</span> solved</span>
              <span><span className="text-[#F59E0B] font-medium">{col.attempted}</span> attempted</span>
              <span><span className="text-[#A1A1AA] font-medium">{col.total - col.solved - col.attempted}</span> unsolved</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
