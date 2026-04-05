"use client"

import React from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  CalendarClock, 
  CalendarDays, 
  CheckSquare, 
  TrendingUp, 
  Trophy, 
  Gift, 
  Camera, 
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

interface DashboardSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activePath: string
}

const mainNavItems = [
  { label: 'Today\'s Plan', href: '/dashboard/today', icon: CalendarClock },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Timetables', href: '/dashboard/timetables', icon: CalendarDays },
  { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
]

const toolsNavItems = [
  { label: 'Task Board', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'OCR Scanner', href: '/dashboard/scanner', icon: Camera },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
]

const accountNavItems = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Gift },
]

export function DashboardSidebar({ collapsed, onToggleCollapse, activePath }: DashboardSidebarProps) {
  return (
    <aside
      className="relative flex flex-col shrink-0 h-full bg-[#111111] border-r border-[#2A2A2A] transition-[width] duration-200 ease-in-out z-40 overflow-hidden"
      style={{ width: collapsed ? 56 : 220 }}
    >
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-[#2A2A2A] flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.35)] flex-shrink-0">
            <LayoutDashboard className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-[#F0F0F0] tracking-tight text-sm whitespace-nowrap">
              StudyForge
            </span>
          )}
        </Link>
      </div>

      {/* Create New CTA */}
      <div className="px-3 py-3 border-b border-[#2A2A2A] flex-shrink-0">
        <Link href="/create">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] cursor-pointer transition-all duration-150 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]">
            <Plus className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="text-xs font-bold whitespace-nowrap">Create New</span>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden space-y-0.5 hide-scrollbar">

        {/* Main section */}
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#606060] px-3 mb-2">
            Main
          </p>
        )}
        {mainNavItems.map(item => {
          const isActive = activePath === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 min-h-[36px] rounded-lg cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-[rgba(16,185,129,0.08)] text-[#10B981] border border-[#10B981]/20'
                  : 'text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0]'
              }`}>
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#10B981]' : ''}`} />
                {!collapsed && (
                  <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="border-t border-[#2A2A2A] my-3" />

        {/* Study Tools section */}
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#606060] px-3 mb-2">
            Study Tools
          </p>
        )}
        {toolsNavItems.map(item => {
          const isActive = activePath === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 min-h-[36px] rounded-lg cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-[rgba(16,185,129,0.08)] text-[#10B981] border border-[#10B981]/20'
                  : 'text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0]'
              }`}>
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#10B981]' : ''}`} />
                {!collapsed && (
                  <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="border-t border-[#2A2A2A] my-3" />

        {/* Account section */}
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#606060] px-3 mb-2">
            Account
          </p>
        )}

        {/* Upgrade to Pro — special styling */}
        <Link href="/pricing">
          <div className="flex items-center gap-3 px-3 min-h-[36px] rounded-lg cursor-pointer transition-all duration-150 text-[#10B981] hover:bg-[rgba(16,185,129,0.08)]">
            <Zap className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && (
              <span className="text-[13px] font-semibold whitespace-nowrap">Upgrade to Pro</span>
            )}
          </div>
        </Link>

        {accountNavItems.map(item => {
          const isActive = activePath === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 min-h-[36px] rounded-lg cursor-pointer transition-all duration-150 ${
                isActive
                  ? 'bg-[rgba(16,185,129,0.08)] text-[#10B981] border border-[#10B981]/20'
                  : 'text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0]'
              }`}>
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#10B981]' : ''}`} />
                {!collapsed && (
                  <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          )
        })}

        {/* Flex grow filler */}
        <div className="flex-1" />
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[#606060] hover:text-[#F0F0F0] hover:bg-[#222222] z-50 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] hidden sm:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
