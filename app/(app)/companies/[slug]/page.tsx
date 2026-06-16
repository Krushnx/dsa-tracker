import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCompanyStats } from "@/lib/services/companies.service";
import { connectDB } from "@/lib/db/mongoose";
import { CompanyDetailClient } from "@/components/companies/CompanyDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyProblem } from "@/models";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCompanyName(slug: string): Promise<string | null> {
  await connectDB();
  const doc = await CompanyProblem.findOne({ companySlug: slug })
    .select("companyName")
    .lean() as { companyName: string } | null;
  return doc?.companyName ?? null;
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const [companyName, stats] = await Promise.all([
    getCompanyName(slug),
    getCompanyStats(slug, session?.user?.id, session?.user?.email ?? undefined),
  ]);

  if (!companyName) notFound();

  const allStat = stats.find((s) => s.timeframe === "all");
  const totalProblems = allStat?.total ?? 0;
  const totalSolved = allStat?.solved ?? 0;
  const percentage =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <div>
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Companies
      </Link>

      {/* Header */}
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-[#FAFAFA] mb-1">
              {companyName}
            </h1>
            <p className="text-sm text-[#71717A]">
              {totalProblems} problems across all timeframes
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#3B82F6]">{percentage}%</p>
            <p className="text-xs text-[#71717A]">
              {totalSolved} / {totalProblems} solved
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 rounded-full bg-[#262626] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#3B82F6] transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Client component handles tabs + table */}
      <CompanyDetailClient companySlug={slug} stats={stats} />
    </div>
  );
}
