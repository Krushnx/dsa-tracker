"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUser } from "@/lib/actions/auth.actions";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const result = await registerUser(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Account created successfully");

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please log in manually.");
        router.push("/login");
        return;
      }

      router.push("/onboarding");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#FAFAFA] mb-1">Create your account</h1>
          <p className="text-sm text-[#A1A1AA]">Start tracking your DSA journey today</p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-[#262626] bg-transparent text-[#FAFAFA] text-sm font-medium hover:bg-[#1a1a1a] transition-colors mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#262626]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#111111] px-3 text-[#71717A]">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Name</label>
            <input
              {...register("name")}
              type="text"
              placeholder="Your name"
              className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
            />
            {errors.name && <p className="mt-1 text-xs text-[#EF4444]">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
            />
            {errors.email && <p className="mt-1 text-xs text-[#EF4444]">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
            />
            {errors.password && <p className="mt-1 text-xs text-[#EF4444]">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="Repeat your password"
              className="w-full h-10 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[#FAFAFA] text-sm placeholder:text-[#71717A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[#EF4444]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#71717A]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3B82F6] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
