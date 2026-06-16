"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Target,
  User,
  Code2,
  Layers,
  Building2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Problems", href: "/problems", icon: BookOpen },
  { label: "Collections", href: "/collections", icon: Layers },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "My Progress", href: "/progress", icon: TrendingUp },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-[#0A0A0A] border-r border-[#262626] fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#262626]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#3B82F6] flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#FAFAFA] text-sm tracking-tight">
            DSA Tracker
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                  : "text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="px-3 py-2 rounded-xl bg-[#111111] border border-[#262626]">
          <p className="text-xs text-[#71717A]">Tracking should take</p>
          <p className="text-xs font-medium text-[#A1A1AA]">less than 5 seconds ⚡</p>
        </div>
      </div>
    </aside>
  );
}
