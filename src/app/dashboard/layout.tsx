"use client";

import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { BookOpen, HelpCircle, LayoutDashboard, Plus, Settings, CalendarDays, LogOut, Menu, CheckSquare, TrendingUp, Camera, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Today", href: "/dashboard/today", icon: CalendarClock },
    { label: "My Timetables", href: "/dashboard/timetables", icon: CalendarDays },
    { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
    { label: "Photo Scanner", href: "/dashboard/scanner", icon: Camera },
    { label: "Create New", href: "/create", icon: Plus, highlight: true },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help", href: "/dashboard/help", icon: HelpCircle },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 p-4 flex-shrink-0 relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

      {/* Logo & Notification Bell */}
      <div className="flex items-center justify-between mb-10 mt-2 z-10">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">StudyForge <span className="text-indigo-400">AI</span></span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 z-10">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  item.highlight
                    ? "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20"
                    : isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.highlight ? "text-indigo-400" : ""}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Card at Bottom */}
      <div className="mt-8 z-10 border-t border-slate-800 pt-4 pb-2">
        <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 mb-4 px-2 rounded-lg py-2 -mx-1 hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <Avatar className="w-9 h-9 border border-slate-700 bg-slate-800 group-hover:border-indigo-500/50 transition-colors">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-slate-800 text-slate-300">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{profile?.full_name || "Guest Student"}</span>
            <span className="text-xs text-slate-500 truncate">{profile?.college || "StudyForge Academy"}</span>
          </div>
        </Link>
        <Button variant="ghost" className="w-full text-left justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-9" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-20">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">StudyForge</span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors focus:outline-none">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-r-slate-800 bg-slate-900 w-64 z-[9999]">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Scrollable Children Canvas */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
