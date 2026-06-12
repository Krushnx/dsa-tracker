import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { getProblemById } from "@/lib/services/problems.service";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { StatusActionButton } from "@/components/problems/StatusActionButton";
import { NotesEditor } from "@/components/problems/NotesEditor";
import type { ProblemStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProblemDetailPage({ params }: Props) {
  const { id } = await params;
  const leetcodeId = parseInt(id, 10);

  if (isNaN(leetcodeId)) notFound();

  const session = await auth();
  const problem = await getProblemById(leetcodeId, session!.user.id);

  if (!problem) notFound();

  const totalVotes = problem.likes + problem.dislikes;
  const likeRatio = totalVotes > 0 ? Math.round((problem.likes / totalVotes) * 100) : 0;

  return (
    <div>
      {/* Back */}
      <Link
        href="/problems"
        className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Problems
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Problem Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[#71717A] tabular-nums">#{problem.leetcodeId}</span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                  {problem.premiumOnly && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                      Premium
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-semibold text-[#FAFAFA]">{problem.title}</h1>
              </div>
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[#262626] text-sm text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA] transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                LeetCode
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-t border-[#262626]">
              <div className="flex items-center gap-1.5 text-sm text-[#71717A]">
                <span className="text-xs">Acceptance</span>
                <span className="font-medium text-[#FAFAFA]">{problem.acceptanceRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[#71717A]">
                <ThumbsUp className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="font-medium text-[#FAFAFA]">{problem.likes.toLocaleString()}</span>
                <span className="text-xs">({likeRatio}%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-[#71717A]">
                <ThumbsDown className="w-3.5 h-3.5 text-[#EF4444]" />
                <span className="font-medium text-[#FAFAFA]">{problem.dislikes.toLocaleString()}</span>
              </div>
              {problem.category && (
                <div className="text-sm text-[#71717A]">
                  <span className="text-xs">Category </span>
                  <span className="font-medium text-[#A1A1AA]">{problem.category}</span>
                </div>
              )}
            </div>

            {/* Topics */}
            {problem.topics.length > 0 && (
              <div className="pt-4 border-t border-[#262626]">
                <p className="text-xs text-[#71717A] mb-2">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#262626] text-[#A1A1AA]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <NotesEditor problemId={problem._id} initialNotes={problem.notes ?? ""} />
        </div>

        {/* Right — Actions */}
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">Track this problem</h3>

            <div className="space-y-2">
              <StatusActionButton
                problemId={problem._id}
                currentStatus={problem.userStatus as ProblemStatus | null}
              />
            </div>

            {problem.userStatus && (
              <div className="mt-4 pt-4 border-t border-[#262626]">
                <p className="text-xs text-[#71717A]">
                  Currently marked as{" "}
                  <span className="font-medium text-[#FAFAFA]">{problem.userStatus}</span>
                </p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-5">
            <h3 className="text-sm font-medium text-[#A1A1AA] mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full h-9 px-3 rounded-xl bg-[#171717] border border-[#262626] text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3B82F6]/30 transition-colors"
              >
                <span>Open on LeetCode</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/problems"
                className="flex items-center justify-between w-full h-9 px-3 rounded-xl bg-[#171717] border border-[#262626] text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
              >
                <span>Browse all problems</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
