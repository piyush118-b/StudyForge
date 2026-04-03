"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  BookOpen, LayoutDashboard, Plus, Settings, CalendarDays,
  LogOut, Menu, CheckSquare, TrendingUp, Camera, CalendarClock,
  Trophy, Gift, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AchievementModal } from "@/components/dashboard/AchievementModal";
import { cn } from "@/lib/utils";

// ─── Nav data ─────────────────────────────────────────────────────────────────
const primaryNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Today", href: "/dashboard/today", icon: CalendarClock },
  { label: "My Timetables", href: "/dashboard/timetables", icon: CalendarDays },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
];

const highlightNav = [
  { label: "Create New", href: "/create", icon: Plus },
];

const secondaryNav = [
  { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { label: "Referrals", href: "/dashboard/referrals", icon: Gift },
  { label: "Photo Scanner", href: "/dashboard/scanner", icon: Camera },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help", href: "/dashboard/help", icon: HelpCircle },
];

// ─── Sidebar Content ──────────────────────────────────────────────────────────
const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 p-4 flex-shrink-0 relative overflow-hidden">

        {/* Decorative blur */}
        <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center justify-between mb-8 mt-2 z-10">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              StudyForge <span className="text-indigo-400">AI</span>
            </span>
          </Link>
          <NotificationBell />
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 space-y-1 z-10">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "bg-slate-800 text-white shadow-sm"
                    : "hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive(item.href) ? "text-indigo-400" : "")} />
                {item.label}
                {isActive(item.href) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </div>
            </Link>
          ))}

          {/* Create button (highlighted) */}
          {highlightNav.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 mt-2">
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          ))}

          {/* Secondary Nav — icons only with tooltips */}
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <p className="text-[10px] font-semibold tracking-widest text-slate-700 uppercase px-3 mb-2">
              More
            </p>
            <div className="flex items-center gap-1 px-1">
              {secondaryNav.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger>
                    <Link href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
                          isActive(item.href)
                            ? "bg-slate-800 text-white"
                            : "text-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </nav>

        {/* User Card */}
        <div className="mt-6 z-10 border-t border-slate-800 pt-4 pb-1">
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg -mx-1 hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <Avatar className="w-9 h-9 border border-slate-700 bg-slate-800 group-hover:border-indigo-500/50 transition-colors">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-slate-800 text-slate-300 text-sm">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {profile?.full_name || "Guest Student"}
              </span>
              <span className="text-xs text-slate-600 truncate">
                {profile?.college || "StudyForge Academy"}
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full text-left justify-start text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 text-xs"
            onClick={signOut}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-20">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">StudyForge</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors focus:outline-none">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-r-slate-800 bg-slate-900 w-64 z-[9999]">
                <SidebarContent onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <AchievementModal />
    </div>
  );
}
