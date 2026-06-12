"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      // Placeholder — password reset email will be wired in Phase 3 extension
      console.log("Reset requested for:", data.email);
      toast.success("If that email exists, a reset link has been sent.");
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#FAFAFA] mb-1">Reset your password</h1>
          <p className="text-sm text-[#A1A1AA]">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#A1A1AA] text-sm mb-6">Check your inbox for the reset link.</p>
            <Link href="/login" className="text-[#3B82F6] text-sm hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-[#71717A]">
              Remember it?{" "}
              <Link href="/login" className="text-[#3B82F6] hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
