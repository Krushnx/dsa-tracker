"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2">Something went wrong</h1>
        <p className="text-[#A1A1AA] text-sm mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
