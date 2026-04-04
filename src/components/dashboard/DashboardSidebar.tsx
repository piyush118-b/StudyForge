"use client"

import React, { useState, useEffect } from 'react'
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
  HelpCircle,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface DashboardSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activePath: string
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Today', href: '/dashboard/today', icon: CalendarClock },
  { label: 'My Timetables', href: '/dashboard/timetables', icon: CalendarDays },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
]

const secondaryNavItems = [
  { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Gift },
  { label: 'Scanner', href: '/dashboard/scanner', icon: Camera },
]

export function DashboardSidebar({ collapsed, onToggleCollapse, activePath }: DashboardSidebarProps) {
  return (
    <aside 
      className="relative flex flex-col shrink-0 h-full bg-[#0A0C14]/60 border-r border-white/5 transition-[width] duration-200 ease-in-out z-40 overflow-hidden"
      style={{ width: collapsed ? 56 : 220 }}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-1 hide-scrollbar">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 px-3 min-h-[36px] w-[204px] rounded-lg cursor-pointer transition-colors ${
              activePath === item.href 
                ? 'bg-indigo-500/15 text-indigo-400 shadow-[inset_3px_0_0_#6366f1]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}

        <Link href="/create">
          <div className="flex items-center gap-3 px-3 min-h-[36px] w-[204px] rounded-lg mt-1 cursor-pointer transition-colors bg-indigo-500 hover:bg-indigo-600 text-white shadow-md">
            <Plus className="w-[18px] h-[18px] shrink-0" />
            <span className={`text-[13px] font-semibold whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              Create New
            </span>
          </div>
        </Link>

        <div className="w-[204px] px-3 my-2">
          <div className="h-px bg-white/5 w-[180px]" />
        </div>

        {secondaryNavItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 px-3 min-h-[36px] w-[204px] rounded-lg cursor-pointer transition-colors text-slate-400 hover:bg-white/5 hover:text-slate-200`}>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}



        {/* Flex grow filler */}
        <div className="flex-1" />
        
        <button className="flex items-center gap-3 px-3 min-h-[36px] w-[204px] rounded-lg cursor-pointer transition-colors text-slate-400 hover:bg-white/5 hover:text-slate-200 mb-12">
          <HelpCircle className="w-[18px] h-[18px] shrink-0" />
          <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
            Help
          </span>
        </button>
      </div>

      <button 
        onClick={onToggleCollapse}
        className="absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 z-50 transition-colors shadow-lg hidden sm:flex"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
