import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCollectionProblems, getCollectionSummaries } from "@/lib/services/collections.service";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { StatusActionButton } from "@/components/problems/StatusActionButton";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ProblemStatus } from "@/types";

interface Props { params: Promise<{ id: string }> }

export default async function CollectionDetailPage({ params }: Props) {
  const { id } = await params;
  const s = await auth();
  const [problems, summaries] = await Promise.all([
    getCollectionProblems(id, s!.user.id, s!.user.email!),
    getCollectionSummaries(s!.user.id, s!.user.email!),
  ]);

  if (!problems) notFound();
  const summary = summaries.find(c => c.id === id)!;

  return (
    <div>
      <Link href="/collections" className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Collections
      </Link>

      {/* Header */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: summary.color }} />
              <h1 className="text-xl font-semibold text-[#FAFAFA]">{summary.title}</h1>
            </div>
            <p className="text-sm text-[#71717A] max-w-xl">{summary.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: summary.color }}>{summary.percentage}%</p>
            <p className="text-xs text-[#71717A]">{summary.solved} / {summary.total} solved</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={summary.percentage} className="h-2 bg-[#262626]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A]">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] w-28">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] hidden md:table-cell">Topics</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717A] w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p._id} className="border-b border-[#262626]/50 hover:bg-[#171717]/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-[#71717A]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/problems/${p.leetcodeId}`} className="text-sm text-[#FAFAFA] hover:text-[#3B82F6] transition-colors font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><DifficultyBadge difficulty={p.difficulty} /></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.topics.slice(0, 2).map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] text-[#71717A] bg-[#262626]">{t}</span>
                      ))}
                      {p.topics.length > 2 && <span className="px-1.5 py-0.5 rounded text-[10px] text-[#71717A] bg-[#262626]">+{p.topics.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/problems/${p.leetcodeId}`} className="h-7 w-7 rounded-lg flex items-center justify-center text-[#71717A] hover:bg-[#262626] hover:text-[#FAFAFA] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <StatusActionButton problemId={p._id} currentStatus={p.userStatus as ProblemStatus | null} compact />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
