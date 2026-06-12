import Link from "next/link";
import {
  Code2,
  TrendingUp,
  Target,
  Flame,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GitBranch,
} from "lucide-react";

// ─── Hero Section ─────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative flex flex-col items-center text-center px-4 pt-24 pb-20 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium mb-6">
          <Flame className="w-3.5 h-3.5" />
          The GitHub for Interview Preparation
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FAFAFA] leading-tight tracking-tight mb-6">
          Track your DSA journey.{" "}
          <span className="text-[#3B82F6]">Stay consistent.</span>
        </h1>

        <p className="text-lg text-[#A1A1AA] max-w-xl mx-auto mb-10 leading-relaxed">
          The simplest way to track your LeetCode progress, maintain solving
          streaks, and visualize your interview preparation — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
          >
            Get Started — it&apos;s free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center h-11 px-6 rounded-xl border border-[#262626] text-[#A1A1AA] text-sm font-medium hover:bg-[#111111] hover:text-[#FAFAFA] transition-colors"
          >
            Log In
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#71717A]">
          No credit card required · 3,647 problems ready to track
        </p>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: "3,647", label: "Problems" },
    { value: "< 5s", label: "To mark solved" },
    { value: "365", label: "Days tracked" },
    { value: "100%", label: "Free forever" },
  ];

  return (
    <section className="border-y border-[#262626] bg-[#0A0A0A]/80 py-6">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-[#3B82F6]">{value}</p>
            <p className="text-xs text-[#71717A] mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: CheckCircle2,
    color: "#22C55E",
    title: "One-click tracking",
    description:
      "Mark problems as Solved, Attempted, or Todo in a single click. Tracking should take less than 5 seconds.",
  },
  {
    icon: Flame,
    color: "#F59E0B",
    title: "Streak system",
    description:
      "Build a daily solving habit. Your streak grows every day you solve at least one problem — miss a day and it resets.",
  },
  {
    icon: BarChart3,
    color: "#3B82F6",
    title: "Visual analytics",
    description:
      "GitHub-style contribution heatmap, difficulty breakdown, topic distribution — see your progress at a glance.",
  },
  {
    icon: Target,
    color: "#EF4444",
    title: "Goal tracking",
    description:
      "Set a target — 100, 300, or 500 problems — and watch your progress bar fill up as you solve more.",
  },
  {
    icon: TrendingUp,
    color: "#A855F7",
    title: "Topic mastery",
    description:
      "Know exactly which topics are your weak spots with per-topic solved counts and progress bars.",
  },
  {
    icon: Code2,
    color: "#06B6D4",
    title: "Full LeetCode library",
    description:
      "All 3,647 LeetCode problems pre-loaded with difficulty, topics, acceptance rate, and direct links.",
  },
];

function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#FAFAFA] mb-3">
            Everything you need to prepare
          </h2>
          <p className="text-[#A1A1AA] max-w-lg mx-auto">
            Built for developers who want to stay organized, consistent, and
            motivated throughout their interview prep.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, description }) => (
            <div
              key={title}
              className="bg-[#111111] border border-[#262626] rounded-2xl p-6 hover:border-[#3B82F6]/30 transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <h3 className="text-[#FAFAFA] font-semibold text-sm mb-2">{title}</h3>
              <p className="text-[#71717A] text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────

function DashboardPreview() {
  return (
    <section className="py-20 px-4 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#FAFAFA] mb-3">
            Your progress, visualized
          </h2>
          <p className="text-[#A1A1AA]">
            A clean dashboard that shows exactly where you stand.
          </p>
        </div>

        {/* Mock Dashboard */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 overflow-hidden">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Solved", value: "247", color: "#3B82F6" },
              { label: "Current Streak", value: "12 🔥", color: "#F59E0B" },
              { label: "Longest Streak", value: "34", color: "#22C55E" },
              { label: "Daily Goal", value: "2 / 3", color: "#A855F7" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-[#171717] border border-[#262626] rounded-xl p-4"
              >
                <p className="text-xs text-[#71717A] mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Heatmap mock */}
          <div className="bg-[#171717] border border-[#262626] rounded-xl p-4 mb-4">
            <p className="text-xs text-[#71717A] mb-3">Activity — last 6 months</p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 130 }).map((_, i) => {
                const intensity = Math.random();
                const bg =
                  intensity > 0.8
                    ? "#22C55E"
                    : intensity > 0.6
                    ? "#16A34A"
                    : intensity > 0.4
                    ? "#15803D"
                    : intensity > 0.2
                    ? "#166534"
                    : "#1a1a1a";
                return (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Easy", solved: 98, total: 800, color: "#22C55E" },
              { label: "Medium", solved: 120, total: 1700, color: "#F59E0B" },
              { label: "Hard", solved: 29, total: 700, color: "#EF4444" },
            ].map(({ label, solved, total, color }) => (
              <div
                key={label}
                className="bg-[#171717] border border-[#262626] rounded-xl p-4"
              >
                <p className="text-xs font-medium mb-1" style={{ color }}>
                  {label}
                </p>
                <p className="text-lg font-bold text-[#FAFAFA]">{solved}</p>
                <div className="mt-2 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(solved / total) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <p className="text-xs text-[#71717A] mt-1">of {total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Streak Preview ───────────────────────────────────────────────────────────

function StreakPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const solved = [3, 0, 5, 2, 4, 1, 3];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium mb-5">
              <Flame className="w-3.5 h-3.5" />
              Streak System
            </div>
            <h2 className="text-3xl font-bold text-[#FAFAFA] mb-4">
              Build the habit. <br />
              Don&apos;t break the chain.
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-6">
              Solve at least one problem per day to keep your streak alive. Miss
              a day and it resets — just like GitHub contributions, but for DSA.
            </p>
            <ul className="space-y-3">
              {[
                "Current and longest streak tracking",
                "GitHub-style 365-day contribution heatmap",
                "Daily goal progress",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Streak card mock */}
          <div className="flex-1 w-full max-w-sm">
            <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#71717A]">Current Streak</p>
                  <p className="text-3xl font-bold text-[#F59E0B] flex items-center gap-2">
                    12 <Flame className="w-6 h-6" />
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#71717A]">Longest</p>
                  <p className="text-3xl font-bold text-[#FAFAFA]">34</p>
                </div>
              </div>

              {/* Weekly bar chart mock */}
              <div className="flex items-end justify-between gap-2 h-20">
                {days.map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${(solved[i] / 5) * 64}px`,
                        backgroundColor: solved[i] > 0 ? "#3B82F6" : "#262626",
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-[10px] text-[#71717A]">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-10 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Code2 className="w-10 h-10 text-[#3B82F6] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#FAFAFA] mb-3">
              Start tracking today
            </h2>
            <p className="text-[#A1A1AA] mb-8">
              Join developers who use DSA Tracker to stay consistent, measure
              progress, and land their dream job.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-xs text-[#71717A]">
              No sign-up friction · Takes 30 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#262626] py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#3B82F6] flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#FAFAFA]">DSA Tracker</span>
        </div>

        <p className="text-xs text-[#71717A]">
          Built for developers preparing for technical interviews.
        </p>

        <div className="flex items-center gap-4 text-xs text-[#71717A]">
          <Link href="/login" className="hover:text-[#A1A1AA] transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-[#A1A1AA] transition-colors">
            Sign Up
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#A1A1AA] transition-colors"
          >
            <GitBranch className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Navbar (public) ──────────────────────────────────────────────────────────

function PublicNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#262626]/50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#3B82F6] flex items-center justify-center">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-[#FAFAFA] text-sm">DSA Tracker</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="h-8 px-4 rounded-lg text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="h-8 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors flex items-center"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <PublicNav />
      <Hero />
      <StatsBar />
      <Features />
      <DashboardPreview />
      <StreakPreview />
      <CTA />
      <Footer />
    </div>
  );
}
