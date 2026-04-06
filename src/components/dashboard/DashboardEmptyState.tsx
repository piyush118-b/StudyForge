"use client"

import React from 'react'
import { Sparkles, PenTool } from 'lucide-react'
import Link from 'next/link'

export function DashboardEmptyState({ hasAnyTimetable }: { hasAnyTimetable: boolean }) {
  
  if (hasAnyTimetable) {
    // Variant B: User has timetables but none is active somehow
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center p-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-[#F0F0F0] mb-2">No Active Timetable</h3>
          <p className="text-sm text-[#A0A0A0] mb-6">You have saved timetables, but none is set to Active.</p>
          <Link href="/dashboard/timetables">
            <button className="px-5 py-2.5 bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] rounded-lg text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_20px_rgba(16,185,129,0.2)] transition-all duration-150-all active:scale-[0.97]">
              Manage Timetables &rarr;
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-forge-base">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        animation: 'patternDrift 20s linear infinite'
      }} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes patternDrift {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes floatCal {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}} />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center p-6">
        
        {/* CSS Calendar Illustration */}
        <div className="mb-10 w-[120px] h-[120px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(16,185,129,0.15)] border border-forge-accent/20 flex flex-col mx-auto" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
          animation: 'floatCal 4s ease-in-out infinite'
        }}>
          <div className="h-7 bg-forge-accent/20 flex items-center justify-center shrink-0 border-b border-forge-accent/20">
            <span className="text-[9px] font-bold tracking-widest text-forge-accent">STUDYFORGE</span>
          </div>
          <div className="flex-1 p-2 grid grid-cols-5 gap-1.5 place-content-start bg-forge-elevated">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-2 rounded-xl" style={{
                background: [0, 2, 5, 7, 11, 14].includes(i) ? 'var(--color-forge-accent)' : 'rgba(255,255,255,0.05)'
              }} />
            ))}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-forge-text-primary mb-3">
          Your workspace is empty, yaar!
        </h2>
        
        <p className="text-sm sm:text-base text-forge-text-secondary mb-10 max-w-sm mx-auto leading-relaxed">
          Create your first clash-free timetable and it'll appear right here — live, editable, and synced across all your devices.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/create/ai">
             <button className="flex items-center justify-center gap-2 w-full sm:w-auto inline-flex h-11 px-6 rounded-lg bg-[#10B981] text-[#0A0A0A] text-sm font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_20px_rgba(16,185,129,0.2)] hover:bg-[#34D399] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.6),0_0_40px_rgba(16,185,129,0.3)] transition-all duration-150-all duration-150 active:scale-[0.97]">
               <Sparkles size={18} className="text-[#0A0A0A]/80" />
               Generate with AI
             </button>
          </Link>

          <Link href="/create/timetable">
             <button className="flex items-center justify-center gap-2 w-full sm:w-auto h-11 px-6 rounded-lg bg-transparent border border-[#2A2A2A] text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] hover:border-[#333333] transition-all duration-150-all font-medium active:scale-[0.97]">
               <PenTool size={18} className="text-[#606060]" />
               Build Manually
             </button>
          </Link>
        </div>

        <p className="mt-12 text-xs font-medium text-forge-text-muted tracking-wide uppercase px-4 py-2 bg-forge-overlay/50 rounded-full border border-forge-border inline-block">
          "10,000+ students already have their week sorted. Join them! 🔥"
        </p>

      </div>
    </div>
  )
}
