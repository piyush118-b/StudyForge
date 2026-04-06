'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, BarChart3,
  CheckSquare, Camera, Trophy,
  Settings, Gift, Zap,
  BookOpen, Plus, PanelLeftClose
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useSubscriptionStore } from '@/store/subscription-store'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  isCollapsed,
}: {
  href:   string
  icon:   React.ElementType
  label:  string
  badge?: string | number
  isCollapsed?: boolean
}) {
  const pathname = usePathname()
  const isActive =
    href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/dashboard/today'
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group flex items-center relative transition-all duration-150 cursor-pointer rounded-md",
        isCollapsed ? "justify-center p-2 mx-auto w-10" : "gap-3 px-2 py-1.5 w-full",
        isActive
          ? "bg-[#1F1F1F] text-[#F0F0F0]"
          : "text-[#8A8A8A] hover:bg-[#1A1A1A] hover:text-[#D0D0D0]"
      )}
    >
      <Icon
        className={cn(
          "relative z-10 flex-shrink-0 transition-colors",
          isCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
          isActive ? "text-[#F0F0F0]" : "text-[#8A8A8A] group-hover:text-[#D0D0D0]"
        )}
      />

      {!isCollapsed && (
        <span className="relative z-10 text-sm font-medium truncate flex-1 leading-5">
          {label}
        </span>
      )}

      {badge && !isCollapsed && (
        <span className="relative z-10 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-[#2A2A2A] text-[#A0A0A0] flex-shrink-0">
          {badge}
        </span>
      )}
    </Link>
  )
}

function SectionLabel({ label, isCollapsed }: { label: string, isCollapsed: boolean }) {
  if (isCollapsed) {
    return <div className="h-4 w-full" /> // minimal spacer
  }
  return (
    <p className="text-[11px] font-semibold tracking-wider text-[#606060] px-2 mb-1 mt-4">
      {label}
    </p>
  )
}

interface DashboardSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activePath: string
}

export function DashboardSidebar({ collapsed, onToggleCollapse, activePath }: DashboardSidebarProps) {
  const { user, profile } = useAuth()
  const { isPro } = useSubscriptionStore()

  const userEmail = user?.email || 'guest@studyforge.ai'
  const userName = profile?.full_name || 'Guest User'
  const userInitial = userName.charAt(0).toUpperCase()

  // Mobile drawer handling
  const prevPath = useRef(activePath)
  useEffect(() => {
    if (prevPath.current !== activePath) {
      prevPath.current = activePath
      if (window.innerWidth < 768 && !collapsed) {
        onToggleCollapse()
      }
    }
  }, [activePath, collapsed, onToggleCollapse])

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggleCollapse}
          aria-hidden
        />
      )}

      <motion.aside
        animate={{ width: collapsed ? 60 : 250 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="
          absolute md:relative flex-shrink-0
          bg-[#0F0F0F] border-r border-[#1F1F1F]
          flex-col h-full overflow-hidden z-40
          max-md:top-0 max-md:left-0 max-md:bottom-0
          flex select-none
        "
      >
        {/* Header - App Logo */}
        <div className="h-14 flex items-center px-4 flex-shrink-0 justify-between">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group cursor-pointer">
              <div className="w-6 h-6 rounded flex-shrink-0 bg-[#F0F0F0] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#0A0A0A]" />
              </div>
              <span className="font-semibold text-[#F0F0F0] text-[15px] tracking-tight truncate">
                StudyForge
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="w-8 h-8 rounded shrink-0 bg-[#F0F0F0] flex items-center justify-center mx-auto cursor-pointer">
               <BookOpen className="w-4 h-4 text-[#0A0A0A]" />
            </Link>
          )}

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-6 h-6 rounded flex items-center justify-center text-[#606060] hover:text-[#A0A0A0] hover:bg-[#1A1A1A] transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sidebar Collapse Button for collapsed state */}
        {collapsed && (
          <div className="flex justify-center mt-2 mb-2 w-full">
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded flex items-center justify-center text-[#606060] hover:text-[#A0A0A0] hover:bg-[#1A1A1A] transition-colors"
              aria-label="Expand sidebar"
            >
              <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.25 }}>
                 <PanelLeftClose className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <div className={cn("flex-shrink-0 mb-2 mt-2", collapsed ? "px-2" : "px-3")}>
          <Link href="/create">
            <div
               className={cn(
                 "flex items-center rounded-md border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222222] hover:border-[#3A3A3A] text-[#F0F0F0] cursor-pointer transition-all duration-150",
                 collapsed ? "justify-center p-2 w-10 mx-auto" : "gap-2 px-3 py-1.5"
               )}
            >
              <Plus className={cn("shrink-0", collapsed ? "w-[18px] h-[18px]" : "w-4 h-4")} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">Create New</span>
              )}
            </div>
           </Link>
        </div>

        {/* Nav Links */}
        <nav className={cn("flex-1 overflow-y-auto space-y-0.5 custom-scrollbar pb-4", collapsed ? "px-2" : "px-3")}>
          <SectionLabel label="General" isCollapsed={collapsed} />
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Today's Plan" isCollapsed={collapsed} />
          <NavItem href="/dashboard/timetables" icon={Calendar} label="Timetables" isCollapsed={collapsed} />
          <NavItem href="/dashboard/analytics" icon={BarChart3} label="Analytics" isCollapsed={collapsed} />

          <SectionLabel label="Tools" isCollapsed={collapsed} />
          <NavItem href="/dashboard/tasks" icon={CheckSquare} label="Task Board" isCollapsed={collapsed} />
          <NavItem href="/dashboard/scanner" icon={Camera} label="OCR Scanner" isCollapsed={collapsed} />
          <NavItem href="/dashboard/achievements" icon={Trophy} label="Achievements" isCollapsed={collapsed} />

          <SectionLabel label="Account" isCollapsed={collapsed} />
          <Link
            href="/pricing"
            className={cn(
              "group flex items-center relative transition-all duration-150 cursor-pointer rounded-md text-[#10B981]",
              collapsed ? "justify-center p-2 mx-auto w-10" : "gap-3 px-2 py-1.5 w-full",
              "hover:bg-[rgba(16,185,129,0.08)]"
            )}
          >
            <Zap className={cn("relative z-10 flex-shrink-0 transition-colors", collapsed ? "w-[18px] h-[18px]" : "w-4 h-4")} />
            {!collapsed && <span className="relative z-10 text-sm font-medium truncate flex-1 leading-5">Upgrade</span>}
          </Link>
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" isCollapsed={collapsed} />
          <NavItem href="/dashboard/referrals" icon={Gift} label="Referrals" isCollapsed={collapsed} />
        </nav>

        {/* User Footer */}
        <div className={cn("flex-shrink-0 py-3", collapsed ? "px-2" : "px-4")}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-full mx-auto bg-[#222222] border border-[#333333] flex items-center justify-center text-[10px] font-medium text-[#F0F0F0]">
              {userInitial}
            </div>
          ) : (
            <Link href="/profile" className="flex items-center gap-3 w-full rounded-lg hover:bg-[#1A1A1A] px-2 py-1.5 -ml-2 transition-all duration-150">
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-[#222222] border border-[#333333] flex items-center justify-center text-xs font-medium text-[#F0F0F0]">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F0F0F0] truncate leading-tight">{userName}</p>
                <p className="text-xs text-[#8A8A8A] truncate leading-tight mt-0.5">{isPro ? 'Pro Member' : 'Free Plan'}</p>
              </div>
            </Link>
          )}
          {!collapsed && (
            <p className="text-[10px] text-[#505050] mt-3 font-mono">
              Press ? for shortcuts
            </p>
          )}
        </div>
      </motion.aside>
    </>
  )
}

