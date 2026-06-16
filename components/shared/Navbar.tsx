"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Search, Menu, X, LogOut, User, Users,Code2,
  LayoutDashboard, BookOpen, TrendingUp, Target, Layers, Building2,
} from "lucide-react";
import { NotificationToggle } from "@/components/shared/NotificationToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
 { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Problems", href: "/problems", icon: BookOpen },
  { label: "Collections", href: "/collections", icon: Layers },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "DSA Buddy", href: "/buddy", icon: Users },
  { label: "My Progress", href: "/progress", icon: TrendingUp },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Profile", href: "/profile", icon: User },
];

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-[#262626] fixed top-0 right-0 left-0 lg:left-[260px] z-20 flex items-center px-4 md:px-6 gap-4">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger>
          <div
            role="button"
            aria-label="Open menu"
            className="lg:hidden text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] bg-[#0A0A0A] border-r border-[#262626] p-0">
          {/* Mobile Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#262626]">
            <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <div className="w-7 h-7 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[#FAFAFA] text-sm">DSA Tracker</span>
            </Link>
            <button
              className="ml-auto text-[#71717A] hover:text-[#FAFAFA]"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Nav */}
          <nav className="px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "text-[#A1A1AA] hover:bg-[#171717] hover:text-[#FAFAFA]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-[#111111] border border-[#262626] text-[#71717A]">
        <Search className="w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search problems..."
          className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#71717A] outline-none"
        />
        <kbd className="hidden md:inline-flex text-xs text-[#71717A] bg-[#262626] px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationToggle />
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              role="button"
              aria-label="User menu"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
                <AvatarFallback className="bg-[#3B82F6] text-white text-xs font-medium">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm text-[#A1A1AA]">
                {session?.user?.name?.split(" ")[0]}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#111111] border-[#262626] text-[#FAFAFA]"
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-[#FAFAFA] truncate">{session?.user?.name}</p>
              <p className="text-xs text-[#71717A] truncate">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem className="cursor-pointer hover:bg-[#171717] focus:bg-[#171717] text-[#A1A1AA] p-0">
              <Link href="/profile" className="flex items-center w-full px-2 py-1.5">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer text-[#EF4444] hover:bg-[#EF4444]/10 focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
