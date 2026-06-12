import Link from "next/link";
import { Code2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mx-auto mb-6">
          <Code2 className="w-6 h-6 text-[#3B82F6]" />
        </div>
        <h1 className="text-6xl font-bold text-[#FAFAFA] mb-3">404</h1>
        <p className="text-[#A1A1AA] mb-8">This page doesn&apos;t exist.</p>
        <Link
          href="/dashboard"
          className="h-10 px-6 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors inline-flex items-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
