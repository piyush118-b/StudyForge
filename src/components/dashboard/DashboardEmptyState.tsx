"use client"

import React from 'react'
import { Sparkles, PenTool } from 'lucide-react'
import Link from 'next/link'

export function DashboardEmptyState({ hasAnyTimetable }: { hasAnyTimetable: boolean }) {
  
  if (hasAnyTimetable) {
    // Variant B: User has timetables but none is active somehow
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#080C14]">
        <div className="text-center p-8 bg-slate-900/50 border border-white/5 rounded-2xl max-w-md">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Active Timetable</h3>
          <p className="text-sm text-slate-400 mb-6">You have saved timetables, but none is set to Active.</p>
          <Link href="/dashboard/timetables">
            <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-lg transition-colors">
              Manage Timetables &rarr;
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#080C14]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
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
        <div className="mb-10 w-[120px] h-[120px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(99,102,241,0.2)] border border-indigo-500/30 flex flex-col mx-auto" style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          animation: 'floatCal 4s ease-in-out infinite'
        }}>
          <div className="h-7 bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold tracking-widest text-white/90">STUDYFORGE</span>
          </div>
          <div className="flex-1 p-2 grid grid-cols-5 gap-1.5 place-content-start">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-2 rounded-sm" style={{
                background: [0, 2, 5, 7, 11, 14].includes(i) ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.08)'
              }} />
            ))}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Your workspace is empty, yaar!
        </h2>
        
        <p className="text-sm sm:text-base text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
          Create your first clash-free timetable and it'll appear right here — live, editable, and synced across all your devices.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link href="/create/choose">
             <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-105 active:scale-95">
               <Sparkles size={18} className="text-indigo-200" />
               Generate with AI
             </button>
          </Link>

          <Link href="/timetable/draft?mode=manual">
             <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 hover:border-slate-600 transition-all">
               <PenTool size={18} className="text-slate-400" />
               Build Manually
             </button>
          </Link>
        </div>

        <p className="mt-12 text-xs font-medium text-slate-500 tracking-wide uppercase px-4 py-2 bg-slate-900/50 rounded-full border border-white/5 inline-block">
          "10,000+ students already have their week sorted. Join them! 🔥"
        </p>

      </div>
    </div>
  )
}
