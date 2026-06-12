"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DAILY_GOAL_OPTIONS = [1, 2, 3, 5];
const TARGET_OPTIONS = [100, 300, 500];

export default function OnboardingPage() {
  const router = useRouter();
  const [dailyGoal, setDailyGoal] = useState(2);
  const [target, setTarget] = useState(300);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Save onboarding preferences — will wire to server action in Phase 12
      toast.success("Preferences saved!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#FAFAFA] mb-1">Set your goals 🎯</h1>
          <p className="text-sm text-[#A1A1AA]">
            Personalize your experience — you can always change this later
          </p>
        </div>

        {/* Daily Goal */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
            Daily problem goal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOAL_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDailyGoal(n)}
                className={`h-10 rounded-xl text-sm font-medium transition-colors border ${
                  dailyGoal === n
                    ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                    : "bg-transparent border-[#262626] text-[#A1A1AA] hover:border-[#3B82F6]/50 hover:text-[#FAFAFA]"
                }`}
              >
                {n} {n === 1 ? "problem" : "problems"}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
            Total target problems
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TARGET_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTarget(n)}
                className={`h-10 rounded-xl text-sm font-medium transition-colors border ${
                  target === n
                    ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                    : "bg-transparent border-[#262626] text-[#A1A1AA] hover:border-[#3B82F6]/50 hover:text-[#FAFAFA]"
                }`}
              >
                {n} problems
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-10 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : "Continue to Dashboard →"}
        </button>
      </div>
    </div>
  );
}
