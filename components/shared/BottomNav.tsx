"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, TrendingUp, Target, User, Layers, Building2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Problems", href: "/problems", icon: BookOpen },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0A0A0A] border-t border-[#262626] flex items-center h-16 safe-area-pb">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
              isActive ? "text-[#3B82F6]" : "text-[#71717A] hover:text-[#A1A1AA]"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
